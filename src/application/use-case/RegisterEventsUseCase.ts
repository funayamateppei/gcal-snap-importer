import type { UseCase } from '../base/UseCase';
import { Result } from '../../shared/domain/Result';
import type { ICalendarService } from '../../domain/calendar-integration/service/ICalendarService';
import { CalendarEventBatch } from '../../domain/calendar-integration/entity/CalendarEventBatch.entity';
import type { ShiftEventDTO } from '../dto/ShiftEventDTO';
import { ShiftEventMapper } from '../dto/ShiftEventDTO';

export interface RegisterEventsUseCaseInput {
  events: ShiftEventDTO[];
  accessToken: string;
}

export interface RegisterEventsUseCaseOutput {
  totalCount: number;
  successCount: number;
  failureCount: number;
  errors: string[];
}

/**
 * イベント一括登録ユースケース
 * Google Calendarにイベントを一括登録
 */
export class RegisterEventsUseCase implements UseCase<RegisterEventsUseCaseInput, RegisterEventsUseCaseOutput> {
  constructor(
    private readonly calendarService: ICalendarService,
  ) {}

  async execute(input: RegisterEventsUseCaseInput): Promise<Result<RegisterEventsUseCaseOutput, Error>> {
    try {
      // 1. DTOをエンティティに変換
      const events = ShiftEventMapper.toDomains(input.events);

      // 2. CalendarEventBatchを作成
      const batchResult = CalendarEventBatch.create(events);

      if (batchResult.isFailure) {
        return Result.fail(batchResult.error);
      }

      // 3. 一括登録
      const registrationResult = await this.calendarService.registerBatch(
        batchResult.value,
        input.accessToken,
      );

      if (registrationResult.isFailure) {
        return Result.fail(registrationResult.error);
      }

      const result = registrationResult.value;

      // 4. 結果を返却
      return Result.ok({
        totalCount: result.totalCount,
        successCount: result.successCount,
        failureCount: result.failureCount,
        errors: [...result.errors],
      });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
