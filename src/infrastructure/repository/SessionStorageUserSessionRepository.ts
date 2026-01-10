import { Result } from '../../shared/domain/Result';
import type { IUserSessionRepository } from '../../domain/authentication/repository/IUserSessionRepository';
import { UserSession } from '../../domain/authentication/entity/UserSession.entity';
import { UserProfile } from '../../domain/authentication/value-object/UserProfile.vo';

const SESSION_STORAGE_KEY = 'userSession';

interface StoredSession {
  id: string;
  accessToken: string;
  profile: {
    name: string;
    email?: string;
    picture?: string;
  };
  authenticatedAt: string;
  expiresAt?: string;
}

/**
 * SessionStorage を使用したユーザーセッションリポジトリ実装
 */
export class SessionStorageUserSessionRepository implements IUserSessionRepository {
  async save(session: UserSession): Promise<Result<void, Error>> {
    try {
      const stored: StoredSession = {
        id: session.id,
        accessToken: session.accessToken,
        profile: {
          name: session.profile.name,
          email: session.profile.email,
          picture: session.profile.picture,
        },
        authenticatedAt: session.authenticatedAt.toISOString(),
        expiresAt: session.expiresAt?.toISOString(),
      };

      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stored));
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async findCurrent(): Promise<Result<UserSession | null, Error>> {
    try {
      const data = sessionStorage.getItem(SESSION_STORAGE_KEY);

      if (!data) {
        return Result.ok(null);
      }

      const stored: StoredSession = JSON.parse(data);

      const profileResult = UserProfile.create(
        stored.profile.name,
        stored.profile.email,
        stored.profile.picture,
      );

      if (profileResult.isFailure) {
        return Result.fail(profileResult.error);
      }

      const sessionResult = UserSession.create(
        stored.accessToken,
        profileResult.value,
        stored.expiresAt ? new Date(stored.expiresAt) : undefined,
        stored.id,
      );

      if (sessionResult.isFailure) {
        return Result.fail(sessionResult.error);
      }

      return Result.ok(sessionResult.value);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async clear(): Promise<Result<void, Error>> {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
