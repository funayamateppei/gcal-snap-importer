import type { UseCase } from '../base/UseCase';
import { Result } from '../../shared/domain/Result';
import type { IShiftExtractionService } from '../../domain/shift-parsing/service/IShiftExtractionService';
import type { IShiftRepository } from '../../domain/shift-parsing/repository/IShiftRepository';
import { ShiftImage } from '../../domain/shift-parsing/entity/ShiftImage.entity';
import type { ShiftEventDTO } from '../dto/ShiftEventDTO';
import { ShiftEventMapper } from '../dto/ShiftEventDTO';
import { ShiftEvent } from '../../domain/event-management/entity/ShiftEvent.entity';
import { ShiftType } from '../../domain/event-management/value-object/ShiftType.vo';
import { TimeWindow } from '../../domain/event-management/value-object/TimeWindow.vo';

export interface ParseShiftImageUseCaseInput {
  base64Data: string;
  fileName: string;
  contextYear?: number;
}

export interface ParseShiftImageUseCaseOutput {
  events: ShiftEventDTO[];
  extractedCount: number;
}

/**
 * シフト画像解析ユースケース
 * 画像からシフト情報を抽出し、イベントに変換
 */
export class ParseShiftImageUseCase implements UseCase<ParseShiftImageUseCaseInput, ParseShiftImageUseCaseOutput> {
  constructor(
    private readonly extractionService: IShiftExtractionService,
    private readonly shiftRepository: IShiftRepository,
  ) {}

  async execute(input: ParseShiftImageUseCaseInput): Promise<Result<ParseShiftImageUseCaseOutput, Error>> {
    try {
      // 1. ShiftImage エンティティを作成
      const imageResult = ShiftImage.create(input.base64Data, input.fileName);

      if (imageResult.isFailure) {
        return Result.fail(imageResult.error);
      }

      // 2. シフト情報を抽出
      const extractionResult = await this.extractionService.extract(
        imageResult.value,
        input.contextYear,
      );

      if (extractionResult.isFailure) {
        return Result.fail(extractionResult.error);
      }

      const schedule = extractionResult.value;

      // 3. 抽出結果を永続化
      const saveResult = await this.shiftRepository.save(schedule);

      if (saveResult.isFailure) {
        return Result.fail(saveResult.error);
      }

      // 4. 勤務シフトのみをShiftEventに変換
      const events: ShiftEvent[] = [];

      for (const shift of schedule.getWorkShifts()) {
        const shiftType = this.mapSymbolToShiftType(shift.symbol.getValue());
        const timeWindow = this.mapSymbolToTimeWindow(shift.symbol.getValue());

        if (shiftType && timeWindow) {
          const eventResult = ShiftEvent.createWorkEvent(
            shiftType,
            shift.date.toDate(),
            timeWindow,
          );

          if (eventResult.isSuccess) {
            events.push(eventResult.value);
          }
        }
      }

      // 5. DTOに変換して返却
      return Result.ok({
        events: ShiftEventMapper.toDTOs(events),
        extractedCount: schedule.getShiftCount(),
      });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  private mapSymbolToShiftType(symbol: string): ShiftType | null {
    switch (symbol) {
      case 'A':
        return ShiftType.earlyShift();
      case 'B':
        return ShiftType.middleShift();
      case 'C':
        return ShiftType.lateShift();
      default:
        return null;
    }
  }

  private mapSymbolToTimeWindow(symbol: string): TimeWindow | null {
    switch (symbol) {
      case 'A':
        return TimeWindow.earlyShift();
      case 'B':
        return TimeWindow.middleShift();
      case 'C':
        return TimeWindow.lateShift();
      default:
        return null;
    }
  }
}
