import { GoogleGenAI } from '@google/genai'
import { z } from 'zod'
import { Result } from '../../shared/domain/Result'
import type { IShiftExtractionService } from '../../domain/shift-parsing/service/IShiftExtractionService'
import { ShiftImage } from '../../domain/shift-parsing/entity/ShiftImage.entity'
import { ExtractedShiftSchedule } from '../../domain/shift-parsing/entity/ExtractedShiftSchedule.entity'
import { ExtractedShift } from '../../domain/shift-parsing/entity/ExtractedShift.entity'
import { ShiftSymbol } from '../../domain/shift-parsing/value-object/ShiftSymbol.vo'
import { ShiftDate } from '../../domain/shift-parsing/value-object/ShiftDate.vo'
import { ShiftExtractionFailedError } from '../../domain/shift-parsing/error/ShiftParsingError'
import { generatePrompt } from '../../utils/prompt'
import { shiftEventSchema, geminiSchema } from '../../utils/gemini'

/**
 * Gemini API を使用したシフト抽出サービス実装
 */
export class GeminiShiftExtractionService implements IShiftExtractionService {
  constructor(private readonly apiKey: string) {}

  async extract(
    image: ShiftImage,
    contextYear?: number
  ): Promise<Result<ExtractedShiftSchedule, ShiftExtractionFailedError>> {
    try {
      // モックデータモードの場合
      if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        return this.extractMock(image)
      }

      const ai = new GoogleGenAI({ apiKey: this.apiKey })

      const modelName = import.meta.env.VITE_GEMINI_MODEL || 'gemini-3-flash-preview'

      const prompt = generatePrompt(contextYear ?? new Date().getFullYear())
      const base64Data = image.getPureBase64Data()

      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  data: base64Data,
                  mimeType: image.getMimeType() ?? 'image/jpeg',
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: geminiSchema,
          temperature: 0, // 確定的な出力のため
          topP: 0.95,
          topK: 40,
        },
      })

      const text = response.text

      if (!text) {
        return Result.fail(new ShiftExtractionFailedError('No text response from Gemini API'))
      }

      const json = JSON.parse(text)
      const events = z.array(shiftEventSchema).parse(json)

      // DTO からドメインエンティティに変換
      const shifts: ExtractedShift[] = []

      for (const event of events) {
        const dateStr = event.start.split('T')[0] // "2025-11-04"
        const dateResult = ShiftDate.fromString(dateStr)

        if (dateResult.isFailure) {
          console.warn('Invalid date:', dateStr)
          continue
        }

        // summary から シフトシンボルを推測（早番→A, 中番→B, 遅番→C）
        const symbol = this.mapSummaryToSymbol(event.summary)
        const symbolResult = ShiftSymbol.create(symbol)

        if (symbolResult.isFailure) {
          console.warn('Invalid symbol:', symbol)
          continue
        }

        const shiftResult = ExtractedShift.create(
          dateResult.value,
          symbolResult.value,
          JSON.stringify(event)
        )

        if (shiftResult.isSuccess) {
          shifts.push(shiftResult.value)
        }
      }

      if (shifts.length === 0) {
        return Result.fail(new ShiftExtractionFailedError('No valid shifts extracted'))
      }

      const scheduleResult = ExtractedShiftSchedule.create(shifts, image.id)

      if (scheduleResult.isFailure) {
        return Result.fail(new ShiftExtractionFailedError(scheduleResult.error.message))
      }

      return Result.ok(scheduleResult.value)
    } catch (error) {
      return Result.fail(
        new ShiftExtractionFailedError(
          `Failed to extract shifts: ${(error as Error).message}`,
          error
        )
      )
    }
  }

  private mapSummaryToSymbol(summary: string): string {
    if (summary.includes('早番')) return 'A'
    if (summary.includes('中番')) return 'B'
    if (summary.includes('遅番')) return 'C'
    return 'OTHER'
  }

  private async extractMock(
    image: ShiftImage
  ): Promise<Result<ExtractedShiftSchedule, ShiftExtractionFailedError>> {
    // モックデータ（開発用）
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const mockShifts: ExtractedShift[] = [
      ExtractedShift.create(ShiftDate.create(2026, 1, 11).value, ShiftSymbol.create('A').value)
        .value,
      ExtractedShift.create(ShiftDate.create(2026, 1, 12).value, ShiftSymbol.create('B').value)
        .value,
      ExtractedShift.create(ShiftDate.create(2026, 1, 13).value, ShiftSymbol.create('C').value)
        .value,
    ]

    return Result.ok(ExtractedShiftSchedule.create(mockShifts, image.id).value)
  }
}
