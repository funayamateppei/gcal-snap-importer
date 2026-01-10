import { Result } from '../../shared/domain/Result';
import type { IEventRepository } from '../../domain/event-management/repository/IEventRepository';
import { ShiftEvent } from '../../domain/event-management/entity/ShiftEvent.entity';
import { ShiftType } from '../../domain/event-management/value-object/ShiftType.vo';

const STORAGE_KEY = 'shiftEvents';

interface StoredEvent {
  id: string;
  summary: string;
  start: string; // ISO 8601
  end: string;   // ISO 8601
  allDay: boolean;
}

/**
 * LocalStorage を使用したイベントリポジトリ実装
 */
export class LocalStorageEventRepository implements IEventRepository {
  async save(event: ShiftEvent): Promise<Result<void, Error>> {
    try {
      const allEventsResult = await this.findAll();
      if (allEventsResult.isFailure) {
        return Result.fail(allEventsResult.error);
      }

      const events = allEventsResult.value;
      const existingIndex = events.findIndex(e => e.id === event.id);

      if (existingIndex >= 0) {
        events[existingIndex] = event;
      } else {
        events.push(event);
      }

      return this.saveAll(events);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async saveAll(events: ShiftEvent[]): Promise<Result<void, Error>> {
    try {
      const stored: StoredEvent[] = events.map(event => ({
        id: event.id,
        summary: event.summary.getValue(),
        start: event.getStartISO(),
        end: event.getEndISO(),
        allDay: event.allDay,
      }));

      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async findById(id: string): Promise<Result<ShiftEvent | null, Error>> {
    try {
      const allEventsResult = await this.findAll();
      if (allEventsResult.isFailure) {
        return Result.fail(allEventsResult.error);
      }

      const event = allEventsResult.value.find(e => e.id === id);
      return Result.ok(event ?? null);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async findAll(): Promise<Result<ShiftEvent[], Error>> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);

      if (!data) {
        return Result.ok([]);
      }

      const stored: StoredEvent[] = JSON.parse(data);
      const events: ShiftEvent[] = [];

      for (const storedEvent of stored) {
        const entityResult = this.toEntity(storedEvent);
        if (entityResult.isFailure) {
          console.warn('Failed to parse event:', entityResult.error);
          continue;
        }
        events.push(entityResult.value);
      }

      return Result.ok(events);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Result<ShiftEvent[], Error>> {
    try {
      const allEventsResult = await this.findAll();
      if (allEventsResult.isFailure) {
        return Result.fail(allEventsResult.error);
      }

      const filtered = allEventsResult.value.filter(
        event => event.start >= startDate && event.end <= endDate,
      );

      return Result.ok(filtered);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async delete(id: string): Promise<Result<void, Error>> {
    try {
      const allEventsResult = await this.findAll();
      if (allEventsResult.isFailure) {
        return Result.fail(allEventsResult.error);
      }

      const filtered = allEventsResult.value.filter(e => e.id !== id);
      return this.saveAll(filtered);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async clear(): Promise<Result<void, Error>> {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  private toEntity(stored: StoredEvent): Result<ShiftEvent, Error> {
    try {
      const summaryResult = ShiftType.create(stored.summary);
      if (summaryResult.isFailure) {
        return Result.fail(summaryResult.error);
      }

      const start = new Date(stored.start);
      const end = new Date(stored.end);

      const eventResult = ShiftEvent.create(
        summaryResult.value,
        start,
        end,
        stored.allDay,
        stored.id,
      );

      if (eventResult.isFailure) {
        return Result.fail(eventResult.error);
      }

      return Result.ok(eventResult.value);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
