import { ValueObject } from '../../../shared/domain/ValueObject';
import { Result } from '../../../shared/domain/Result';
import { ValidationError } from '../../../shared/domain/DomainError';

interface APIKeyProps {
  value: string;
}

/**
 * APIキー Value Object
 * Gemini APIキーを表現
 */
export class APIKey extends ValueObject<APIKeyProps> {
  private constructor(props: APIKeyProps) {
    super(props);
  }

  static create(value: string): Result<APIKey, ValidationError> {
    if (!value || value.trim() === '') {
      return Result.fail(
        new ValidationError('API key is required'),
      );
    }

    // 基本的な形式チェック（Google API Keyの形式）
    if (value.trim().length < 20) {
      return Result.fail(
        new ValidationError('API key is too short'),
      );
    }

    return Result.ok(new APIKey({ value: value.trim() }));
  }

  getValue(): string {
    return this.props.value;
  }

  /**
   * マスクされた値を取得（セキュリティのため）
   */
  getMaskedValue(): string {
    const value = this.props.value;
    if (value.length <= 8) {
      return '****';
    }
    return `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
  }

  toString(): string {
    return this.getMaskedValue();
  }
}
