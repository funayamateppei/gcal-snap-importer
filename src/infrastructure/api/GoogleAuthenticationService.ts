import { Result } from '../../shared/domain/Result';
import type { IAuthenticationService } from '../../domain/authentication/service/IAuthenticationService';
import { UserSession } from '../../domain/authentication/entity/UserSession.entity';
import { UserProfile } from '../../domain/authentication/value-object/UserProfile.vo';
import { AuthenticationFailedError } from '../../domain/authentication/error/AuthenticationError';

/**
 * Google OAuth を使用した認証サービス実装
 */
export class GoogleAuthenticationService implements IAuthenticationService {
  async fetchUserProfile(
    accessToken: string,
  ): Promise<Result<UserProfile, AuthenticationFailedError>> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        return Result.fail(
          new AuthenticationFailedError('Failed to fetch user profile'),
        );
      }

      const data = await response.json();

      const profileResult = UserProfile.create(
        data.name || 'Unknown User',
        data.email,
        data.picture,
      );

      if (profileResult.isFailure) {
        return Result.fail(
          new AuthenticationFailedError(profileResult.error.message),
        );
      }

      return Result.ok(profileResult.value);
    } catch (error) {
      return Result.fail(
        new AuthenticationFailedError((error as Error).message),
      );
    }
  }

  async createSession(
    accessToken: string,
  ): Promise<Result<UserSession, AuthenticationFailedError>> {
    try {
      // プロフィールを取得
      const profileResult = await this.fetchUserProfile(accessToken);

      if (profileResult.isFailure) {
        return Result.fail(profileResult.error);
      }

      // セッションを作成
      const sessionResult = UserSession.create(accessToken, profileResult.value);

      if (sessionResult.isFailure) {
        return Result.fail(
          new AuthenticationFailedError(sessionResult.error.message),
        );
      }

      return Result.ok(sessionResult.value);
    } catch (error) {
      return Result.fail(
        new AuthenticationFailedError((error as Error).message),
      );
    }
  }
}
