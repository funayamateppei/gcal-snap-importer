import { Result } from '../../../shared/domain/Result';
import { ShiftEvent } from '../entity/ShiftEvent.entity';

/**
 * イベントリポジトリインターフェース
 * Infrastructure層で実装される
 */
export interface IEventRepository {
  /**
   * イベントを保存
   */
  save(event: ShiftEvent): Promise<Result<void, Error>>;

  /**
   * 複数のイベントを保存
   */
  saveAll(events: ShiftEvent[]): Promise<Result<void, Error>>;

  /**
   * IDでイベントを取得
   */
  findById(id: string): Promise<Result<ShiftEvent | null, Error>>;

  /**
   * すべてのイベントを取得
   */
  findAll(): Promise<Result<ShiftEvent[], Error>>;

  /**
   * 日付範囲でイベントを取得
   */
  findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Result<ShiftEvent[], Error>>;

  /**
   * イベントを削除
   */
  delete(id: string): Promise<Result<void, Error>>;

  /**
   * すべてのイベントを削除
   */
  clear(): Promise<Result<void, Error>>;
}
