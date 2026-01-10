import { GoogleGenerativeAI, SchemaType, type ResponseSchema } from '@google/generative-ai'
import { z } from 'zod'
import type { ShiftEvent } from '../types'
import { generatePrompt } from './prompt'
import { mockShiftEvents } from './mockData'

const shiftEventSchema = z.object({
  summary: z.string(),
  start: z.string(),
  end: z.string(),
  allDay: z.boolean(),
})

// Gemini API用のスキーマ定義
const geminiSchema: ResponseSchema = {
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      summary: {
        type: SchemaType.STRING,
        description: 'シフトの種類（早番、中番、遅番、休み）',
      },
      start: {
        type: SchemaType.STRING,
        description:
          '開始日時（ISO 8601形式、日本標準時 +09:00を含めること。例: 2025-11-04T09:30:00+09:00）',
      },
      end: {
        type: SchemaType.STRING,
        description:
          '終了日時（ISO 8601形式、日本標準時 +09:00を含めること。例: 2025-11-04T19:00:00+09:00）',
      },
      allDay: {
        type: SchemaType.BOOLEAN,
        description: '終日イベントかどうか',
      },
    },
    required: ['summary', 'start', 'end', 'allDay'],
  },
}

export const parseShiftImage = async (
  apiKey: string,
  imageBase64: string,
  year: number
): Promise<ShiftEvent[]> => {
  // 開発環境でモックデータを使用する
  if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
    console.log('🎭 モックデータを使用しています（トークン消費なし）')
    // 実際のAPI呼び出しをシミュレートするための遅延
    await new Promise((resolve) => setTimeout(resolve, 1500))
    return mockShiftEvents
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: geminiSchema,
    },
  })

  const prompt = generatePrompt(year)

  // data:image/png;base64, プレフィックスを削除
  const base64Data = imageBase64.split(',')[1] || imageBase64

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: base64Data,
        mimeType: 'image/jpeg',
      },
    },
  ])

  const response = await result.response
  const text = response.text()

  try {
    const json = JSON.parse(text)
    const events = z.array(shiftEventSchema).parse(json)
    return events
  } catch (error) {
    console.error('Failed to parse Gemini response:', text, error)
    throw new Error('Geminiからの応答を解析できませんでした。')
  }
}
