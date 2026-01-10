import { DomainError } from '../../../shared/domain/DomainError';

/**
 * カレンダー登録エラー
 */
export class CalendarRegistrationError extends DomainError {
  constructor(message: string, public readonly cause?: unknown) {
    super('CALENDAR_REGISTRATION_ERROR', message);
  }
}

/**
 * カレンダーAPI呼び出しエラー
 */
export class CalendarAPIError extends DomainError {
  constructor(message: string, public readonly statusCode?: number) {
    super('CALENDAR_API_ERROR', message);
  }
}

export type CalendarIntegrationError = CalendarRegistrationError | CalendarAPIError;
