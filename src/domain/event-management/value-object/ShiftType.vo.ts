import { ValueObject } from '../../../shared/domain/ValueObject';
import { Result } from '../../../shared/domain/Result';
import { ValidationError } from '../../../shared/domain/DomainError';

export type ShiftTypeValue = '早番' | '中番' | '遅番' | '休み';

interface ShiftTypeProps {
  value: ShiftTypeValue;
}

/**
 * シフトタイプ Value Object
 * カレンダーイベントとして登録する際のシフト種別
 */
export class ShiftType extends ValueObject<ShiftTypeProps> {
  private constructor(props: ShiftTypeProps) {
    super(props);
  }

  static create(value: string): Result<ShiftType, ValidationError> {
    const normalized = this.normalize(value);

    if (!this.isValid(normalized)) {
      return Result.fail(
        new ValidationError(`Invalid shift type: ${value}`),
      );
    }

    return Result.ok(new ShiftType({ value: normalized }));
  }

  static earlyShift(): ShiftType {
    return new ShiftType({ value: '早番' });
  }

  static middleShift(): ShiftType {
    return new ShiftType({ value: '中番' });
  }

  static lateShift(): ShiftType {
    return new ShiftType({ value: '遅番' });
  }

  static dayOff(): ShiftType {
    return new ShiftType({ value: '休み' });
  }

  private static normalize(value: string): ShiftTypeValue {
    const trimmed = value.trim();

    // シンボルからの変換
    switch (trimmed.toUpperCase()) {
      case 'A':
        return '早番';
      case 'B':
        return '中番';
      case 'C':
        return '遅番';
      default:
        return trimmed as ShiftTypeValue;
    }
  }

  private static isValid(value: ShiftTypeValue): boolean {
    return ['早番', '中番', '遅番', '休み'].includes(value);
  }

  getValue(): ShiftTypeValue {
    return this.props.value;
  }

  isWorkShift(): boolean {
    return ['早番', '中番', '遅番'].includes(this.props.value);
  }

  isDayOff(): boolean {
    return this.props.value === '休み';
  }

  toString(): string {
    return this.props.value;
  }
}
