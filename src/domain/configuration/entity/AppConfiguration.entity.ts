import { Entity } from '../../../shared/domain/Entity';
import { Result } from '../../../shared/domain/Result';
import { ValidationError } from '../../../shared/domain/DomainError';
import { APIKey } from '../value-object/APIKey.vo';

export interface AppConfigurationProps {
  apiKey: APIKey;
  selectedYear: number;
  updatedAt: Date;
}

/**
 * アプリケーション設定エンティティ
 */
export class AppConfiguration extends Entity<AppConfigurationProps> {
  private constructor(props: AppConfigurationProps, id?: string) {
    super(props, id);
  }

  static create(
    apiKey: APIKey,
    selectedYear: number,
    id?: string,
  ): Result<AppConfiguration, ValidationError> {
    const currentYear = new Date().getFullYear();
    if (selectedYear < currentYear - 1 || selectedYear > currentYear + 1) {
      return Result.fail(
        new ValidationError(`Invalid year: ${selectedYear}`),
      );
    }

    return Result.ok(
      new AppConfiguration(
        {
          apiKey,
          selectedYear,
          updatedAt: new Date(),
        },
        id,
      ),
    );
  }

  get apiKey(): APIKey {
    return this.props.apiKey;
  }

  get selectedYear(): number {
    return this.props.selectedYear;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * APIキーを更新
   */
  updateAPIKey(newApiKey: APIKey): Result<AppConfiguration, ValidationError> {
    return Result.ok(
      new AppConfiguration(
        {
          ...this.props,
          apiKey: newApiKey,
          updatedAt: new Date(),
        },
        this.id,
      ),
    );
  }

  /**
   * 年を更新
   */
  updateYear(newYear: number): Result<AppConfiguration, ValidationError> {
    const currentYear = new Date().getFullYear();
    if (newYear < currentYear - 1 || newYear > currentYear + 1) {
      return Result.fail(
        new ValidationError(`Invalid year: ${newYear}`),
      );
    }

    return Result.ok(
      new AppConfiguration(
        {
          ...this.props,
          selectedYear: newYear,
          updatedAt: new Date(),
        },
        this.id,
      ),
    );
  }
}
