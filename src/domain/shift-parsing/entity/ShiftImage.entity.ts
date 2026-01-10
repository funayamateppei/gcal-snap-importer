import { Entity } from '../../../shared/domain/Entity';
import { Result } from '../../../shared/domain/Result';
import { ValidationError } from '../../../shared/domain/DomainError';

export interface ShiftImageProps {
  base64Data: string;
  fileName: string;
  uploadedAt: Date;
}

/**
 * シフト画像エンティティ
 * アップロードされたシフト表の画像を表現
 */
export class ShiftImage extends Entity<ShiftImageProps> {
  private constructor(props: ShiftImageProps, id?: string) {
    super(props, id);
  }

  static create(
    base64Data: string,
    fileName: string,
    id?: string,
  ): Result<ShiftImage, ValidationError> {
    if (!this.isValidBase64(base64Data)) {
      return Result.fail(
        new ValidationError('Invalid base64 image data'),
      );
    }

    if (!fileName || fileName.trim() === '') {
      return Result.fail(
        new ValidationError('File name is required'),
      );
    }

    return Result.ok(
      new ShiftImage(
        {
          base64Data,
          fileName,
          uploadedAt: new Date(),
        },
        id,
      ),
    );
  }

  private static isValidBase64(data: string): boolean {
    if (!data) return false;

    // base64のフォーマットチェック
    const base64Regex = /^data:image\/(png|jpg|jpeg|gif|webp);base64,/;
    return base64Regex.test(data);
  }

  get base64Data(): string {
    return this.props.base64Data;
  }

  get fileName(): string {
    return this.props.fileName;
  }

  get uploadedAt(): Date {
    return this.props.uploadedAt;
  }

  /**
   * 画像のMIMEタイプを取得
   */
  getMimeType(): string | null {
    const match = this.props.base64Data.match(/^data:image\/([^;]+);base64,/);
    return match ? `image/${match[1]}` : null;
  }

  /**
   * base64エンコードされた実データ部分のみを取得
   */
  getPureBase64Data(): string {
    return this.props.base64Data.replace(/^data:image\/[^;]+;base64,/, '');
  }
}
