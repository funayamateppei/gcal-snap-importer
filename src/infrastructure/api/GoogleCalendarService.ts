import { Result } from '../../shared/domain/Result';
import type { ICalendarService } from '../../domain/calendar-integration/service/ICalendarService';
import { CalendarEventBatch } from '../../domain/calendar-integration/entity/CalendarEventBatch.entity';
import { RegistrationResult } from '../../domain/calendar-integration/value-object/RegistrationResult.vo';
import { CalendarRegistrationError } from '../../domain/calendar-integration/error/CalendarIntegrationError';
import { ShiftEvent } from '../../domain/event-management/entity/ShiftEvent.entity';

interface GoogleCalendarEvent {
  summary: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
}

/**
 * Google Calendar API を使用したカレンダーサービス実装
 */
export class GoogleCalendarService implements ICalendarService {
  private readonly baseUrl = 'https://www.googleapis.com/calendar/v3';

  async registerBatch(
    batch: CalendarEventBatch,
    accessToken: string,
  ): Promise<Result<RegistrationResult, CalendarRegistrationError>> {
    try {
      const googleEvents = batch.events.map(event => this.toGoogleEvent(event));
      const results = await this.insertBatch(accessToken, googleEvents);

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      const errors = results.filter(r => !r.success).map(r => r.error || 'Unknown error');

      return Result.ok(
        RegistrationResult.create(
          batch.getEventCount(),
          successCount,
          failureCount,
          errors,
        ),
      );
    } catch (error) {
      return Result.fail(
        new CalendarRegistrationError(
          `Failed to register batch: ${(error as Error).message}`,
          error,
        ),
      );
    }
  }

  async registerSingle(
    event: ShiftEvent,
    accessToken: string,
  ): Promise<Result<void, CalendarRegistrationError>> {
    try {
      const googleEvent = this.toGoogleEvent(event);
      await this.insertSingle(accessToken, googleEvent);
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new CalendarRegistrationError(
          `Failed to register event: ${(error as Error).message}`,
          error,
        ),
      );
    }
  }

  private toGoogleEvent(event: ShiftEvent): GoogleCalendarEvent {
    if (event.allDay) {
      // 終日イベント
      return {
        summary: event.summary.getValue(),
        start: { date: event.start.toISOString().split('T')[0] },
        end: { date: event.end.toISOString().split('T')[0] },
      };
    } else {
      // 時刻指定イベント
      return {
        summary: event.summary.getValue(),
        start: { dateTime: event.getStartISO() },
        end: { dateTime: event.getEndISO() },
      };
    }
  }

  private async insertSingle(accessToken: string, event: GoogleCalendarEvent): Promise<void> {
    const response = await fetch(`${this.baseUrl}/calendars/primary/events`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to create event');
    }
  }

  private async insertBatch(
    accessToken: string,
    events: GoogleCalendarEvent[],
  ): Promise<{ success: boolean; error?: string }[]> {
    const boundary = 'batch_' + Math.random().toString(36).substring(2);

    const batchBody = events
      .map((event, index) => {
        const requestBody = JSON.stringify(event);
        return [
          `--${boundary}`,
          'Content-Type: application/http',
          `Content-ID: <item${index}>`,
          '',
          'POST /calendar/v3/calendars/primary/events',
          'Content-Type: application/json',
          '',
          requestBody,
        ].join('\r\n');
      })
      .join('\r\n');

    const fullBody = `${batchBody}\r\n--${boundary}--`;

    // Google API Key を環境変数から取得（バッチリクエストで必要な場合）
    const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    const batchUrl = googleApiKey
      ? `https://www.googleapis.com/batch/calendar/v3?key=${googleApiKey}`
      : 'https://www.googleapis.com/batch/calendar/v3';

    const response = await fetch(batchUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/mixed; boundary=${boundary}`,
      },
      body: fullBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Batch request failed: ${errorText}`);
    }

    const responseText = await response.text();

    // バッチレスポンスをパース
    const results: { success: boolean; error?: string }[] = [];
    const responseParts = responseText.split(/--batch_[\w]+/);

    for (const part of responseParts) {
      if (part.includes('HTTP/1.1')) {
        const statusMatch = part.match(/HTTP\/1\.1 (\d+)/);
        if (statusMatch) {
          const status = parseInt(statusMatch[1]);
          if (status >= 200 && status < 300) {
            results.push({ success: true });
          } else {
            const errorMatch = part.match(/"message":\s*"([^"]+)"/);
            results.push({
              success: false,
              error: errorMatch ? errorMatch[1] : `HTTP ${status}`,
            });
          }
        }
      }
    }

    return results;
  }
}
