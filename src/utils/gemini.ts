import { Type, type Schema } from '@google/genai'
import { z } from 'zod'

export const shiftEventSchema = z.object({
  summary: z.string(),
  start: z.string(),
  end: z.string(),
  allDay: z.boolean(),
})

// Gemini API用のスキーマ定義
export const geminiSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      summary: {
        type: Type.STRING,
        description: 'シフトの種類（早番、中番、遅番、休み）',
      },
      start: {
        type: Type.STRING,
        description:
          '開始日時（ISO 8601形式、日本標準時 +09:00を含めること。例: 2025-11-04T09:30:00+09:00）',
      },
      end: {
        type: Type.STRING,
        description:
          '終了日時（ISO 8601形式、日本標準時 +09:00を含めること。例: 2025-11-04T19:00:00+09:00）',
      },
      allDay: {
        type: Type.BOOLEAN,
        description: '終日イベントかどうか',
      },
    },
    required: ['summary', 'start', 'end', 'allDay'],
  },
}
