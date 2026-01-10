import { Entity } from '../../../shared/domain/Entity';
import { Result } from '../../../shared/domain/Result';
import { ValidationError } from '../../../shared/domain/DomainError';
import { ShiftDate } from '../value-object/ShiftDate.vo';
import { ShiftSymbol } from '../value-object/ShiftSymbol.vo';

export interface ExtractedShiftProps {
  date: ShiftDate;
  symbol: ShiftSymbol;
  rawText?: string; // AI抽出時の元テキスト（デバッグ用）
}

/**
 * 抽出されたシフトエンティティ
 * 1日分のシフト情報を表現
 */
export class ExtractedShift extends Entity<ExtractedShiftProps> {
  private constructor(props: ExtractedShiftProps, id?: string) {
    super(props, id);
  }

  static create(
    date: ShiftDate,
    symbol: ShiftSymbol,
    rawText?: string,
    id?: string,
  ): Result<ExtractedShift, ValidationError> {
    return Result.ok(
      new ExtractedShift(
        {
          date,
          symbol,
          rawText,
        },
        id,
      ),
    );
  }

  get date(): ShiftDate {
    return this.props.date;
  }

  get symbol(): ShiftSymbol {
    return this.props.symbol;
  }

  get rawText(): string | undefined {
    return this.props.rawText;
  }

  /**
   * 勤務シフトかどうか
   */
  isWorkShift(): boolean {
    return this.props.symbol.isWorkShift();
  }

  /**
   * その他（休みなど）かどうか
   */
  isOther(): boolean {
    return this.props.symbol.isOther();
  }
}
