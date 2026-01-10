import { Entity } from '../../../shared/domain/Entity';
import { Result } from '../../../shared/domain/Result';
import { ValidationError } from '../../../shared/domain/DomainError';
import { UserProfile } from '../value-object/UserProfile.vo';

export interface UserSessionProps {
  accessToken: string;
  profile: UserProfile;
  authenticatedAt: Date;
  expiresAt?: Date;
}

/**
 * ユーザーセッションエンティティ
 * 認証されたユーザーのセッション情報を表現
 */
export class UserSession extends Entity<UserSessionProps> {
  private constructor(props: UserSessionProps, id?: string) {
    super(props, id);
  }

  static create(
    accessToken: string,
    profile: UserProfile,
    expiresAt?: Date,
    id?: string,
  ): Result<UserSession, ValidationError> {
    if (!accessToken || accessToken.trim() === '') {
      return Result.fail(
        new ValidationError('Access token is required'),
      );
    }

    return Result.ok(
      new UserSession(
        {
          accessToken,
          profile,
          authenticatedAt: new Date(),
          expiresAt,
        },
        id,
      ),
    );
  }

  get accessToken(): string {
    return this.props.accessToken;
  }

  get profile(): UserProfile {
    return this.props.profile;
  }

  get authenticatedAt(): Date {
    return this.props.authenticatedAt;
  }

  get expiresAt(): Date | undefined {
    return this.props.expiresAt;
  }

  /**
   * セッションが有効かどうか
   */
  isValid(): boolean {
    if (!this.props.expiresAt) {
      return true; // 有効期限が設定されていない場合は常に有効
    }

    return this.props.expiresAt > new Date();
  }

  /**
   * セッションが期限切れかどうか
   */
  isExpired(): boolean {
    return !this.isValid();
  }

  /**
   * トークンを更新
   */
  updateToken(newAccessToken: string): Result<UserSession, ValidationError> {
    if (!newAccessToken || newAccessToken.trim() === '') {
      return Result.fail(
        new ValidationError('Access token is required'),
      );
    }

    return Result.ok(
      new UserSession(
        {
          ...this.props,
          accessToken: newAccessToken,
        },
        this.id,
      ),
    );
  }
}
