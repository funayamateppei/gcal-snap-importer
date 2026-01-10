import { ValueObject } from '../../../shared/domain/ValueObject';
import { Result } from '../../../shared/domain/Result';
import { ValidationError } from '../../../shared/domain/DomainError';

interface ShiftDateProps {
  year: number;
  month: number;
  day: number;
}

/**
 * シフト日付 Value Object
 * 年月日を表現する
 */
export class ShiftDate extends ValueObject<ShiftDateProps> {
  private constructor(props: ShiftDateProps) {
    super(props);
  }

  static create(
    year: number,
    month: number,
    day: number,
  ): Result<ShiftDate, ValidationError> {
    if (!this.isValid(year, month, day)) {
      return Result.fail(
        new ValidationError(
          `Invalid date: ${year}-${month}-${day}`,
        ),
      );
    }

    return Result.ok(new ShiftDate({ year, month, day }));
  }

  static fromString(dateString: string): Result<ShiftDate, ValidationError> {
    const match = dateString.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (!match) {
      return Result.fail(
        new ValidationError(`Invalid date format: ${dateString}`),
      );
    }

    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);

    return this.create(year, month, day);
  }

  private static isValid(year: number, month: number, day: number): boolean {
    if (year < 1900 || year > 2100) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;

    // 実際の日付として有効かチェック
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  toDate(): Date {
    return new Date(this.props.year, this.props.month - 1, this.props.day);
  }

  toISOString(): string {
    const month = this.props.month.toString().padStart(2, '0');
    const day = this.props.day.toString().padStart(2, '0');
    return `${this.props.year}-${month}-${day}`;
  }

  get year(): number {
    return this.props.year;
  }

  get month(): number {
    return this.props.month;
  }

  get day(): number {
    return this.props.day;
  }
}
