import { DomainError } from '../../../shared/domain/DomainError';

/**
 * イベント編集不可エラー
 */
export class EventNotEditableError extends DomainError {
  constructor(eventId: string) {
    super('EVENT_NOT_EDITABLE', `Event ${eventId} is not editable (past event)`);
  }
}

/**
 * イベント無効エラー
 */
export class InvalidEventError extends DomainError {
  constructor(message: string) {
    super('INVALID_EVENT', message);
  }
}

/**
 * イベント重複エラー
 */
export class DuplicateEventError extends DomainError {
  constructor(date: string) {
    super('DUPLICATE_EVENT', `Event already exists for date: ${date}`);
  }
}
