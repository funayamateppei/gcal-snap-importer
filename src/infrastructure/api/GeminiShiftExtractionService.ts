import { GoogleGenerativeAI, SchemaType, type ResponseSchema } from '@google/generative-ai';
import { z } from 'zod';
import { Result } from '../../shared/domain/Result';
import type { IShiftExtractionService } from '../../domain/shift-parsing/service/IShiftExtractionService';
import { ShiftImage } from '../../domain/shift-parsing/entity/ShiftImage.entity';
import { ExtractedShiftSchedule } from '../../domain/shift-parsing/entity/ExtractedShiftSchedule.entity';
import { ExtractedShift } from '../../domain/shift-parsing/entity/ExtractedShift.entity';
import { ShiftSymbol } from '../../domain/shift-parsing/value-object/ShiftSymbol.vo';
import { ShiftDate } from '../../domain/shift-parsing/value-object/ShiftDate.vo';
import { ShiftExtractionFailedError } from '../../domain/shift-parsing/error/ShiftParsingError';
import { generatePrompt } from '../../utils/prompt';

const shiftEventSchema = z.object({
  summary: z.string(),
  start: z.string(),
  end: z.string(),
  allDay: z.boolean(),
});

const geminiSchema: ResponseSchema = {
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      summary: { type: SchemaType.STRING, description: 'シフトの種類（早番、中番、遅番、休み）' },
      start: { type: SchemaType.STRING, description: '開始日時（ISO 8601形式、日本標準時 +09:00を含めること。例: 2025-11-04T09:30:00+09:00）' },
      end: { type: SchemaType.STRING, description: '終了日時（ISO 8601形式、日本標準時 +09:00を含めること。例: 2025-11-04T19:00:00+09:00）' },
      allDay: { type: SchemaType.BOOLEAN, description: '終日イベントかどうか' },
    },
    required: ['summary', 'start', 'end', 'allDay'],
  },
};

/**
 * Gemini API を使用したシフト抽出サービス実装
 */
export class GeminiShiftExtractionService implements IShiftExtractionService {
  constructor(private readonly apiKey: string) {}

  async extract(
    image: ShiftImage,
    contextYear?: number,
  ): Promise<Result<ExtractedShiftSchedule, ShiftExtractionFailedError>> {
    try {
      // モックデータモードの場合
      if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        return this.extractMock(image);
      }

      const genAI = new GoogleGenerativeAI(this.apiKey);

      // モデル名を環境変数から取得（デフォルト: gemini-2.0-flash-thinking-exp-01-21）
      // 推論機能により、複雑な表の解析精度が向上します
      const modelName = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash-thinking-exp-01-21';

      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: geminiSchema,
        },
      });

      const prompt = generatePrompt(contextYear ?? new Date().getFullYear());
      const base64Data = image.getPureBase64Data();

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: image.getMimeType() ?? 'image/jpeg',
          },
        },
      ]);

      const response = await result.response;
      const text = response.text();

      const json = JSON.parse(text);
      const events = z.array(shiftEventSchema).parse(json);

      // DTO からドメインエンティティに変換
      const shifts: ExtractedShift[] = [];

      for (const event of events) {
        const dateStr = event.start.split('T')[0]; // "2025-11-04"
        const dateResult = ShiftDate.fromString(dateStr);

        if (dateResult.isFailure) {
          console.warn('Invalid date:', dateStr);
          continue;
        }

        // summary から シフトシンボルを推測（早番→A, 中番→B, 遅番→C）
        const symbol = this.mapSummaryToSymbol(event.summary);
        const symbolResult = ShiftSymbol.create(symbol);

        if (symbolResult.isFailure) {
          console.warn('Invalid symbol:', symbol);
          continue;
        }

        const shiftResult = ExtractedShift.create(
          dateResult.value,
          symbolResult.value,
          JSON.stringify(event),
        );

        if (shiftResult.isSuccess) {
          shifts.push(shiftResult.value);
        }
      }

      if (shifts.length === 0) {
        return Result.fail(
          new ShiftExtractionFailedError('No valid shifts extracted'),
        );
      }

      const scheduleResult = ExtractedShiftSchedule.create(shifts, image.id);

      if (scheduleResult.isFailure) {
        return Result.fail(
          new ShiftExtractionFailedError(scheduleResult.error.message),
        );
      }

      return Result.ok(scheduleResult.value);
    } catch (error) {
      return Result.fail(
        new ShiftExtractionFailedError(
          `Failed to extract shifts: ${(error as Error).message}`,
          error,
        ),
      );
    }
  }

  private mapSummaryToSymbol(summary: string): string {
    if (summary.includes('早番')) return 'A';
    if (summary.includes('中番')) return 'B';
    if (summary.includes('遅番')) return 'C';
    return 'OTHER';
  }

  private async extractMock(
    image: ShiftImage,
  ): Promise<Result<ExtractedShiftSchedule, ShiftExtractionFailedError>> {
    // モックデータ（開発用）
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockShifts: ExtractedShift[] = [
      ExtractedShift.create(
        ShiftDate.create(2026, 1, 11).value,
        ShiftSymbol.create('A').value,
      ).value,
      ExtractedShift.create(
        ShiftDate.create(2026, 1, 12).value,
        ShiftSymbol.create('B').value,
      ).value,
      ExtractedShift.create(
        ShiftDate.create(2026, 1, 13).value,
        ShiftSymbol.create('C').value,
      ).value,
    ];

    return Result.ok(
      ExtractedShiftSchedule.create(mockShifts, image.id).value,
    );
  }
}
