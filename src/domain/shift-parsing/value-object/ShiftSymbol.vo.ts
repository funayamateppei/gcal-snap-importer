import { ValueObject } from '../../../shared/domain/ValueObject';
import { Result } from '../../../shared/domain/Result';
import { ValidationError } from '../../../shared/domain/DomainError';

export type ShiftSymbolType = 'A' | 'B' | 'C' | 'OTHER';

interface ShiftSymbolProps {
  value: ShiftSymbolType;
}

/**
 * シフトシンボル Value Object
 * A=早番, B=中番, C=遅番, OTHER=その他（休み、所用など）
 */
export class ShiftSymbol extends ValueObject<ShiftSymbolProps> {
  private constructor(props: ShiftSymbolProps) {
    super(props);
  }

  static create(value: string): Result<ShiftSymbol, ValidationError> {
    const normalizedValue = this.normalize(value);

    if (!this.isValid(normalizedValue)) {
      return Result.fail(
        new ValidationError(`Invalid shift symbol: ${value}`),
      );
    }

    return Result.ok(new ShiftSymbol({ value: normalizedValue }));
  }

  private static normalize(value: string): ShiftSymbolType {
    const upperValue = value.toUpperCase().trim();

    switch (upperValue) {
      case 'A':
        return 'A';
      case 'B':
        return 'B';
      case 'C':
        return 'C';
      default:
        return 'OTHER';
    }
  }

  private static isValid(value: ShiftSymbolType): boolean {
    return ['A', 'B', 'C', 'OTHER'].includes(value);
  }

  getValue(): ShiftSymbolType {
    return this.props.value;
  }

  isWorkShift(): boolean {
    return ['A', 'B', 'C'].includes(this.props.value);
  }

  isOther(): boolean {
    return this.props.value === 'OTHER';
  }

  toString(): string {
    return this.props.value;
  }
}
