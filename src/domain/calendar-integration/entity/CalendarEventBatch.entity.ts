import { Entity } from '../../../shared/domain/Entity';
import { Result } from '../../../shared/domain/Result';
import { ValidationError } from '../../../shared/domain/DomainError';
import { ShiftEvent } from '../../event-management/entity/ShiftEvent.entity';

export interface CalendarEventBatchProps {
  events: ShiftEvent[];
  createdAt: Date;
}

/**
 * カレンダーイベントバッチエンティティ
 * 複数のイベントを一括登録するためのコンテナ
 */
export class CalendarEventBatch extends Entity<CalendarEventBatchProps> {
  private constructor(props: CalendarEventBatchProps, id?: string) {
    super(props, id);
  }

  static create(
    events: ShiftEvent[],
    id?: string,
  ): Result<CalendarEventBatch, ValidationError> {
    if (!events || events.length === 0) {
      return Result.fail(
        new ValidationError('Events cannot be empty'),
      );
    }

    return Result.ok(
      new CalendarEventBatch(
        {
          events,
          createdAt: new Date(),
        },
        id,
      ),
    );
  }

  get events(): ReadonlyArray<ShiftEvent> {
    return this.props.events;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  getEventCount(): number {
    return this.props.events.length;
  }

  getWorkShiftCount(): number {
    return this.props.events.filter(e => e.isWorkShift()).length;
  }

  getDayOffCount(): number {
    return this.props.events.filter(e => e.isDayOff()).length;
  }
}
