import { Result } from '../../shared/domain/Result';
import type { IShiftRepository } from '../../domain/shift-parsing/repository/IShiftRepository';
import { ExtractedShiftSchedule } from '../../domain/shift-parsing/entity/ExtractedShiftSchedule.entity';
import { ExtractedShift } from '../../domain/shift-parsing/entity/ExtractedShift.entity';
import { ShiftDate } from '../../domain/shift-parsing/value-object/ShiftDate.vo';
import { ShiftSymbol } from '../../domain/shift-parsing/value-object/ShiftSymbol.vo';

const STORAGE_KEY = 'shiftSchedule';

interface StoredShift {
  id: string;
  date: string; // YYYY-MM-DD
  symbol: string;
  rawText?: string;
}

interface StoredSchedule {
  id: string;
  shifts: StoredShift[];
  extractedAt: string;
  sourceImageId: string;
}

/**
 * LocalStorage を使用したシフトリポジトリ実装
 */
export class LocalStorageShiftRepository implements IShiftRepository {
  async save(schedule: ExtractedShiftSchedule): Promise<Result<void, Error>> {
    try {
      const stored: StoredSchedule = {
        id: schedule.id,
        shifts: schedule.shifts.map(shift => ({
          id: shift.id,
          date: shift.date.toISOString(),
          symbol: shift.symbol.getValue(),
          rawText: shift.rawText,
        })),
        extractedAt: schedule.extractedAt.toISOString(),
        sourceImageId: schedule.sourceImageId,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async findLatest(): Promise<Result<ExtractedShiftSchedule | null, Error>> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);

      if (!data) {
        return Result.ok(null);
      }

      const stored: StoredSchedule = JSON.parse(data);
      return this.toEntity(stored);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async findById(id: string): Promise<Result<ExtractedShiftSchedule | null, Error>> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);

      if (!data) {
        return Result.ok(null);
      }

      const stored: StoredSchedule = JSON.parse(data);

      if (stored.id !== id) {
        return Result.ok(null);
      }

      return this.toEntity(stored);
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

  private toEntity(stored: StoredSchedule): Result<ExtractedShiftSchedule, Error> {
    try {
      const shifts: ExtractedShift[] = [];

      for (const storedShift of stored.shifts) {
        const dateResult = ShiftDate.fromString(storedShift.date);
        if (dateResult.isFailure) {
          throw new Error(`Invalid shift date: ${storedShift.date}`);
        }

        const symbolResult = ShiftSymbol.create(storedShift.symbol);
        if (symbolResult.isFailure) {
          throw new Error(`Invalid shift symbol: ${storedShift.symbol}`);
        }

        const shiftResult = ExtractedShift.create(
          dateResult.value,
          symbolResult.value,
          storedShift.rawText,
          storedShift.id,
        );

        if (shiftResult.isFailure) {
          throw new Error(shiftResult.error.message);
        }

        shifts.push(shiftResult.value);
      }

      const scheduleResult = ExtractedShiftSchedule.create(
        shifts,
        stored.sourceImageId,
        stored.id,
      );

      if (scheduleResult.isFailure) {
        return Result.fail(scheduleResult.error);
      }

      return Result.ok(scheduleResult.value);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
