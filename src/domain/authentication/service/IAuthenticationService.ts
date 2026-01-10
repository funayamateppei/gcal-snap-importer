import { Result } from '../../../shared/domain/Result';
import { UserSession } from '../entity/UserSession.entity';
import { UserProfile } from '../value-object/UserProfile.vo';
import type { AuthenticationError } from '../error/AuthenticationError';

/**
 * 認証サービスインターフェース
 * Infrastructure層で実装される（Google OAuth）
 */
export interface IAuthenticationService {
  /**
   * ユーザープロフィールを取得
   */
  fetchUserProfile(
    accessToken: string,
  ): Promise<Result<UserProfile, AuthenticationError>>;

  /**
   * セッションを作成
   */
  createSession(
    accessToken: string,
  ): Promise<Result<UserSession, AuthenticationError>>;
}
