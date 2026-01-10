import { ValueObject } from '../../../shared/domain/ValueObject';
import { Result } from '../../../shared/domain/Result';
import { ValidationError } from '../../../shared/domain/DomainError';

interface TimeWindowProps {
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

/**
 * 時間枠 Value Object
 * シフトの開始時刻と終了時刻を表現
 */
export class TimeWindow extends ValueObject<TimeWindowProps> {
  private constructor(props: TimeWindowProps) {
    super(props);
  }

  static create(
    startHour: number,
    startMinute: number,
    endHour: number,
    endMinute: number,
  ): Result<TimeWindow, ValidationError> {
    if (!this.isValidTime(startHour, startMinute)) {
      return Result.fail(
        new ValidationError(`Invalid start time: ${startHour}:${startMinute}`),
      );
    }

    if (!this.isValidTime(endHour, endMinute)) {
      return Result.fail(
        new ValidationError(`Invalid end time: ${endHour}:${endMinute}`),
      );
    }

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    if (startMinutes >= endMinutes) {
      return Result.fail(
        new ValidationError('Start time must be before end time'),
      );
    }

    return Result.ok(
      new TimeWindow({
        startHour,
        startMinute,
        endHour,
        endMinute,
      }),
    );
  }

  /**
   * 早番の時間枠 (09:30 - 19:00)
   */
  static earlyShift(): TimeWindow {
    return new TimeWindow({
      startHour: 9,
      startMinute: 30,
      endHour: 19,
      endMinute: 0,
    });
  }

  /**
   * 中番の時間枠 (10:30 - 20:00)
   */
  static middleShift(): TimeWindow {
    return new TimeWindow({
      startHour: 10,
      startMinute: 30,
      endHour: 20,
      endMinute: 0,
    });
  }

  /**
   * 遅番の時間枠 (11:30 - 21:00)
   */
  static lateShift(): TimeWindow {
    return new TimeWindow({
      startHour: 11,
      startMinute: 30,
      endHour: 21,
      endMinute: 0,
    });
  }

  private static isValidTime(hour: number, minute: number): boolean {
    return (
      hour >= 0 && hour <= 23 &&
      minute >= 0 && minute <= 59
    );
  }

  get startHour(): number {
    return this.props.startHour;
  }

  get startMinute(): number {
    return this.props.startMinute;
  }

  get endHour(): number {
    return this.props.endHour;
  }

  get endMinute(): number {
    return this.props.endMinute;
  }

  /**
   * 指定された日付に時間枠を適用してDate型を返す
   */
  applyToDate(date: Date, isStart: boolean): Date {
    const result = new Date(date);
    if (isStart) {
      result.setHours(this.props.startHour, this.props.startMinute, 0, 0);
    } else {
      result.setHours(this.props.endHour, this.props.endMinute, 0, 0);
    }
    return result;
  }

  /**
   * 勤務時間を分単位で取得
   */
  getDurationInMinutes(): number {
    const startMinutes = this.props.startHour * 60 + this.props.startMinute;
    const endMinutes = this.props.endHour * 60 + this.props.endMinute;
    return endMinutes - startMinutes;
  }

  toString(): string {
    const formatTime = (hour: number, minute: number) =>
      `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    return `${formatTime(this.props.startHour, this.props.startMinute)} - ${formatTime(this.props.endHour, this.props.endMinute)}`;
  }
}
