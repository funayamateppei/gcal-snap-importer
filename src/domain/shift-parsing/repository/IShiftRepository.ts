import { Result } from '../../../shared/domain/Result';
import { ExtractedShiftSchedule } from '../entity/ExtractedShiftSchedule.entity';

/**
 * シフトリポジトリインターフェース
 * Infrastructure層で実装される（LocalStorage, SessionStorageなど）
 */
export interface IShiftRepository {
  /**
   * シフトスケジュールを保存
   */
  save(schedule: ExtractedShiftSchedule): Promise<Result<void, Error>>;

  /**
   * 最新のシフトスケジュールを取得
   */
  findLatest(): Promise<Result<ExtractedShiftSchedule | null, Error>>;

  /**
   * IDでシフトスケジュールを取得
   */
  findById(id: string): Promise<Result<ExtractedShiftSchedule | null, Error>>;

  /**
   * すべてのシフトスケジュールを削除
   */
  clear(): Promise<Result<void, Error>>;
}
