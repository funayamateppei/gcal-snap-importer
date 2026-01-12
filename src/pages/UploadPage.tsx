import { useState, useCallback, useEffect } from 'react'
import { ImageUploader } from '../components/ImageUploader'
import { YearSelector } from '../components/YearSelector'
import { StatusMessage } from '../components/StatusMessage'
import { LoadingOverlay } from '../components/LoadingOverlay'
import { ImagePreviewDialog } from '../components/ImagePreviewDialog'
import { useParseShiftImage } from '../presentation/hooks'
import { useAppStore } from '../store/useAppStore'
import { useTypedNavigate } from '../hooks/useTypedNavigate'
import { ROUTES } from '../types/routes'
import type { ShiftEventDTO } from '../application/dto/ShiftEventDTO'
import type { ShiftEvent } from '../types'
import { generateDefaultShifts } from '../utils/generateDefaultShifts'

export const UploadPage = () => {
  const navigate = useTypedNavigate()
  const [imageData, setImageData] = useState<string | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Use the new DDD/Clean Architecture hook
  const { parseImage, loading, error: parseError } = useParseShiftImage()

  const {
    apiKey,
    selectedYear,
    message,
    setSelectedYear,
    setEvents,
    setMessage,
    setCurrentStep,
    setApiKey,
    setUploadedImage,
  } = useAppStore()

  // 初期化時にLocalStorageからAPIキーを読み込む（念のため）
  useEffect(() => {
    if (!apiKey) {
      const storedKey = localStorage.getItem('gemini_api_key')
      if (storedKey) {
        setApiKey(storedKey)
      }
    }
  }, [apiKey, setApiKey])

  const handleImageSelected = useCallback(
    (base64: string) => {
      setImageData(base64)
      setUploadedImage(base64)
    },
    [setUploadedImage]
  )

  /**
   * Convert ShiftEventDTO[] to ShiftEvent[] for Zustand store
   */
  const convertDTOToShiftEvent = useCallback((dtos: ShiftEventDTO[]): ShiftEvent[] => {
    return dtos.map((dto) => ({
      summary: dto.summary,
      start: dto.start,
      end: dto.end,
      allDay: dto.allDay,
    }))
  }, [])

  const handleAnalyze = useCallback(async () => {
    if (!apiKey) {
      setMessage({
        text: 'API キーが設定されていません。設定ページから登録してください。',
        type: 'error',
      })
      return
    }
    if (!imageData) {
      setMessage({ text: '画像を選択してください。', type: 'error' })
      return
    }

    setMessage(null)

    try {
      // Use the new DDD/Clean Architecture hook
      const result = await parseImage(imageData, 'uploaded-shift-image.png', selectedYear)

      if (result) {
        // Convert DTOs to Zustand store format
        const shiftEvents = convertDTOToShiftEvent(result.events)
        setEvents(shiftEvents)

        if (result.extractedCount === 0) {
          setMessage({ text: '画像からシフトイベントが見つかりませんでした。', type: 'error' })
        } else {
          setCurrentStep('preview')
          navigate(ROUTES.PREVIEW)
        }
      } else {
        // Error is already set in the hook's error state
        setMessage({ text: parseError || '画像の解析に失敗しました。', type: 'error' })
      }
    } catch (error) {
      setMessage({ text: String(error), type: 'error' })
    }
  }, [
    apiKey,
    imageData,
    selectedYear,
    parseImage,
    parseError,
    convertDTOToShiftEvent,
    setEvents,
    setMessage,
    setCurrentStep,
    navigate,
  ])

  const handleSkip = useCallback(() => {
    if (!selectedYear) {
      setMessage({ text: '年を選択してください。', type: 'error' })
      return
    }

    setMessage(null)

    // Get current month (0-11)
    const month = new Date().getMonth()

    // Generate default shifts (all "休み")
    const defaultShiftsDTO = generateDefaultShifts(selectedYear, month)

    // Convert DTOs to Zustand store format
    const shiftEvents = convertDTOToShiftEvent(defaultShiftsDTO)
    setEvents(shiftEvents)

    // Navigate to preview page
    setCurrentStep('preview')
    navigate(ROUTES.PREVIEW)
  }, [selectedYear, convertDTOToShiftEvent, setEvents, setMessage, setCurrentStep, navigate])

  return (
    <>
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">画像のアップロード</h2>
        <p className="text-sm text-gray-600 mb-6">シフト表の画像をアップロードしてください</p>

        <StatusMessage message={message} />

        <YearSelector year={selectedYear} onYearChange={setSelectedYear} />

        {!imageData && <ImageUploader onImageSelected={handleImageSelected} isLoading={false} />}

        {imageData && (
          <div className="mt-6 space-y-4">
            <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700">選択された画像</h3>
                <button
                  onClick={() => setImageData(null)}
                  className="text-xs text-red-600 hover:text-red-700 underline"
                >
                  削除
                </button>
              </div>
              <div
                className="max-w-full overflow-auto cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setIsPreviewOpen(true)}
              >
                <img
                  src={imageData}
                  alt="選択された画像"
                  className="max-h-96 w-auto rounded border border-gray-300 shadow-sm"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="flex-1 bg-white text-gray-700 border-2 border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-all font-medium disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
                disabled={!selectedYear}
              >
                スキップ
              </button>
              <button
                onClick={handleAnalyze}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={loading}
              >
                解析開始
              </button>
            </div>
          </div>
        )}

        {!imageData && (
          <div className="mt-6">
            <button
              onClick={handleSkip}
              className="w-full bg-white text-gray-700 border-2 border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-all font-medium disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
              disabled={!selectedYear}
            >
              スキップして編集
            </button>
          </div>
        )}
      </div>

      <LoadingOverlay isVisible={loading} />

      <ImagePreviewDialog
        imageUrl={imageData || ''}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </>
  )
}
