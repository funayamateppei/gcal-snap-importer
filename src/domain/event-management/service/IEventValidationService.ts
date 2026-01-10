import { Result } from '../../../shared/domain/Result';
import { ShiftEvent } from '../entity/ShiftEvent.entity';
import { InvalidEventError, DuplicateEventError } from '../error/EventManagementError';

/**
 * イベント検証サービスインターフェース
 */
export interface IEventValidationService {
  /**
   * イベントが有効かどうかを検証
   */
  validate(event: ShiftEvent): Result<boolean, InvalidEventError>;

  /**
   * イベントが重複していないか検証
   */
  checkDuplicate(
    event: ShiftEvent,
    existingEvents: ShiftEvent[],
  ): Result<boolean, DuplicateEventError>;
}
