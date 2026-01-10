import { DomainError } from '../../../shared/domain/DomainError';

/**
 * シフト抽出失敗エラー
 */
export class ShiftExtractionFailedError extends DomainError {
  constructor(message: string, public readonly cause?: unknown) {
    super('SHIFT_EXTRACTION_FAILED', message);
  }
}

/**
 * 画像解析エラー
 */
export class ImageAnalysisError extends DomainError {
  constructor(message: string, public readonly cause?: unknown) {
    super('IMAGE_ANALYSIS_ERROR', message);
  }
}

/**
 * シフトデータ無効エラー
 */
export class InvalidShiftDataError extends DomainError {
  constructor(message: string) {
    super('INVALID_SHIFT_DATA', message);
  }
}
