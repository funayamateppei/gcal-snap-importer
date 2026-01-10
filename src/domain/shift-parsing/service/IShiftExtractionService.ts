import { Result } from '../../../shared/domain/Result';
import { ShiftImage } from '../entity/ShiftImage.entity';
import { ExtractedShiftSchedule } from '../entity/ExtractedShiftSchedule.entity';
import { ShiftExtractionFailedError } from '../error/ShiftParsingError';

/**
 * シフト抽出サービスインターフェース
 * Infrastructure層で実装される（GeminiAPIを使用）
 */
export interface IShiftExtractionService {
  /**
   * 画像からシフト情報を抽出
   */
  extract(
    image: ShiftImage,
    contextYear?: number,
  ): Promise<Result<ExtractedShiftSchedule, ShiftExtractionFailedError>>;
}
