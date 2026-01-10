import { ValueObject } from '../../../shared/domain/ValueObject';

interface RegistrationResultProps {
  totalCount: number;
  successCount: number;
  failureCount: number;
  errors: string[];
}

/**
 * 登録結果 Value Object
 * イベント一括登録の結果を表現
 */
export class RegistrationResult extends ValueObject<RegistrationResultProps> {
  private constructor(props: RegistrationResultProps) {
    super(props);
  }

  static create(
    totalCount: number,
    successCount: number,
    failureCount: number,
    errors: string[] = [],
  ): RegistrationResult {
    return new RegistrationResult({
      totalCount,
      successCount,
      failureCount,
      errors,
    });
  }

  static success(count: number): RegistrationResult {
    return new RegistrationResult({
      totalCount: count,
      successCount: count,
      failureCount: 0,
      errors: [],
    });
  }

  static failure(count: number, errors: string[]): RegistrationResult {
    return new RegistrationResult({
      totalCount: count,
      successCount: 0,
      failureCount: count,
      errors,
    });
  }

  get totalCount(): number {
    return this.props.totalCount;
  }

  get successCount(): number {
    return this.props.successCount;
  }

  get failureCount(): number {
    return this.props.failureCount;
  }

  get errors(): ReadonlyArray<string> {
    return this.props.errors;
  }

  isFullSuccess(): boolean {
    return this.props.successCount === this.props.totalCount;
  }

  isPartialSuccess(): boolean {
    return this.props.successCount > 0 && this.props.failureCount > 0;
  }

  isFullFailure(): boolean {
    return this.props.successCount === 0;
  }

  toString(): string {
    return `Registered ${this.props.successCount}/${this.props.totalCount} events`;
  }
}
