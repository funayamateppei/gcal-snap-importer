import { Entity } from '../../../shared/domain/Entity';
import { Result } from '../../../shared/domain/Result';
import { ValidationError } from '../../../shared/domain/DomainError';
import { ExtractedShift } from './ExtractedShift.entity';

export interface ExtractedShiftScheduleProps {
  shifts: ExtractedShift[];
  extractedAt: Date;
  sourceImageId: string;
}

/**
 * 抽出されたシフトスケジュールエンティティ
 * 複数日分のシフト情報のコレクション
 */
export class ExtractedShiftSchedule extends Entity<ExtractedShiftScheduleProps> {
  private constructor(props: ExtractedShiftScheduleProps, id?: string) {
    super(props, id);
  }

  static create(
    shifts: ExtractedShift[],
    sourceImageId: string,
    id?: string,
  ): Result<ExtractedShiftSchedule, ValidationError> {
    if (!shifts || shifts.length === 0) {
      return Result.fail(
        new ValidationError('Shifts cannot be empty'),
      );
    }

    return Result.ok(
      new ExtractedShiftSchedule(
        {
          shifts,
          extractedAt: new Date(),
          sourceImageId,
        },
        id,
      ),
    );
  }

  get shifts(): ReadonlyArray<ExtractedShift> {
    return this.props.shifts;
  }

  get extractedAt(): Date {
    return this.props.extractedAt;
  }

  get sourceImageId(): string {
    return this.props.sourceImageId;
  }

  /**
   * 勤務シフトのみを取得
   */
  getWorkShifts(): ExtractedShift[] {
    return this.props.shifts.filter(shift => shift.isWorkShift());
  }

  /**
   * シフト数を取得
   */
  getShiftCount(): number {
    return this.props.shifts.length;
  }

  /**
   * 勤務日数を取得
   */
  getWorkDayCount(): number {
    return this.getWorkShifts().length;
  }

  /**
   * 特定の日付のシフトを取得
   */
  getShiftByDate(dateString: string): ExtractedShift | undefined {
    return this.props.shifts.find(
      shift => shift.date.toISOString() === dateString,
    );
  }
}
