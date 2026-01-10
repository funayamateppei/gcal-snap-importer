import { Result } from '../../../shared/domain/Result';
import { UserSession } from '../entity/UserSession.entity';

/**
 * ユーザーセッションリポジトリインターフェース
 * Infrastructure層で実装される（SessionStorage）
 */
export interface IUserSessionRepository {
  /**
   * セッションを保存
   */
  save(session: UserSession): Promise<Result<void, Error>>;

  /**
   * 現在のセッションを取得
   */
  findCurrent(): Promise<Result<UserSession | null, Error>>;

  /**
   * セッションを削除
   */
  clear(): Promise<Result<void, Error>>;
}
