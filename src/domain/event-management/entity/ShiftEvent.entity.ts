import { Entity } from '../../../shared/domain/Entity';
import { Result } from '../../../shared/domain/Result';
import { ValidationError } from '../../../shared/domain/DomainError';
import { ShiftType } from '../value-object/ShiftType.vo';
import { TimeWindow } from '../value-object/TimeWindow.vo';

export interface ShiftEventProps {
  summary: ShiftType;
  start: Date;
  end: Date;
  allDay: boolean;
}

/**
 * シフトイベントエンティティ
 * Google Calendarに登録されるイベント
 */
export class ShiftEvent extends Entity<ShiftEventProps> {
  private constructor(props: ShiftEventProps, id?: string) {
    super(props, id);
  }

  static create(
    summary: ShiftType,
    start: Date,
    end: Date,
    allDay: boolean = false,
    id?: string,
  ): Result<ShiftEvent, ValidationError> {
    if (!allDay && start >= end) {
      return Result.fail(
        new ValidationError('Start time must be before end time'),
      );
    }

    return Result.ok(
      new ShiftEvent(
        {
          summary,
          start,
          end,
          allDay,
        },
        id,
      ),
    );
  }

  /**
   * シフトタイプと日付から作業イベントを作成
   */
  static createWorkEvent(
    shiftType: ShiftType,
    date: Date,
    timeWindow: TimeWindow,
    id?: string,
  ): Result<ShiftEvent, ValidationError> {
    if (!shiftType.isWorkShift()) {
      return Result.fail(
        new ValidationError('Shift type must be a work shift'),
      );
    }

    const start = timeWindow.applyToDate(date, true);
    const end = timeWindow.applyToDate(date, false);

    return this.create(shiftType, start, end, false, id);
  }

  /**
   * 休み（終日イベント）を作成
   */
  static createDayOffEvent(
    date: Date,
    id?: string,
  ): Result<ShiftEvent, ValidationError> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return this.create(ShiftType.dayOff(), start, end, true, id);
  }

  get summary(): ShiftType {
    return this.props.summary;
  }

  get start(): Date {
    return this.props.start;
  }

  get end(): Date {
    return this.props.end;
  }

  get allDay(): boolean {
    return this.props.allDay;
  }

  /**
   * イベントのサマリーを更新
   */
  updateSummary(newSummary: ShiftType): Result<ShiftEvent, ValidationError> {
    return Result.ok(
      new ShiftEvent(
        {
          ...this.props,
          summary: newSummary,
        },
        this.id,
      ),
    );
  }

  /**
   * 時間を更新
   */
  updateTime(
    newStart: Date,
    newEnd: Date,
  ): Result<ShiftEvent, ValidationError> {
    if (!this.props.allDay && newStart >= newEnd) {
      return Result.fail(
        new ValidationError('Start time must be before end time'),
      );
    }

    return Result.ok(
      new ShiftEvent(
        {
          ...this.props,
          start: newStart,
          end: newEnd,
        },
        this.id,
      ),
    );
  }

  /**
   * 過去のイベントかどうか
   */
  isPastEvent(): boolean {
    return this.props.end < new Date();
  }

  /**
   * 未来のイベントかどうか
   */
  isFutureEvent(): boolean {
    return this.props.start > new Date();
  }

  /**
   * 編集可能かどうか（未来のイベントのみ編集可能）
   */
  canEdit(): boolean {
    return this.isFutureEvent();
  }

  /**
   * 勤務シフトかどうか
   */
  isWorkShift(): boolean {
    return this.props.summary.isWorkShift();
  }

  /**
   * 休みかどうか
   */
  isDayOff(): boolean {
    return this.props.summary.isDayOff();
  }

  /**
   * ISO 8601形式の文字列を取得（JST +09:00）
   */
  toISOString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+09:00`;
  }

  getStartISO(): string {
    return this.toISOString(this.props.start);
  }

  getEndISO(): string {
    return this.toISOString(this.props.end);
  }
}
