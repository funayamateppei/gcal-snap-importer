import { Result } from '../../../shared/domain/Result';
import { CalendarEventBatch } from '../entity/CalendarEventBatch.entity';
import { RegistrationResult } from '../value-object/RegistrationResult.vo';
import type { CalendarIntegrationError } from '../error/CalendarIntegrationError';

/**
 * カレンダーサービスインターフェース
 * Infrastructure層で実装される（Google Calendar API）
 */
export interface ICalendarService {
  /**
   * イベントを一括登録
   */
  registerBatch(
    batch: CalendarEventBatch,
    accessToken: string,
  ): Promise<Result<RegistrationResult, CalendarIntegrationError>>;

  /**
   * イベントを個別登録
   */
  registerSingle(
    event: import('../../event-management/entity/ShiftEvent.entity').ShiftEvent,
    accessToken: string,
  ): Promise<Result<void, CalendarIntegrationError>>;
}
