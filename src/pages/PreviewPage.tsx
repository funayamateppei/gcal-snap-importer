import { useState, useMemo, useEffect } from 'react'
import { CameraAlt, CheckCircle } from '@mui/icons-material'
import { useAppStore } from '../store/useAppStore'
import { useTypedNavigate } from '../hooks/useTypedNavigate'
import { useRegisterEvents } from '../presentation/hooks/useRegisterEvents'
import { ROUTES } from '../types/routes'
import { ImagePreviewDialog } from '../components/ImagePreviewDialog'
import type { ShiftEvent } from '../types'
import type { ShiftEventDTO } from '../application/dto/ShiftEventDTO'

type ShiftType = '早番' | '中番' | '遅番' | '休み'

const SHIFT_OPTIONS: ShiftType[] = ['早番', '中番', '遅番', '休み']

const SHIFT_TIME_MAP: Record<ShiftType, { start: string; end: string; allDay: boolean }> = {
  早番: { start: '09:30:00+09:00', end: '19:00:00+09:00', allDay: false },
  中番: { start: '10:30:00+09:00', end: '20:00:00+09:00', allDay: false },
  遅番: { start: '11:30:00+09:00', end: '21:00:00+09:00', allDay: false },
  休み: { start: '', end: '', allDay: true },
}

// シフトの色を定義（より鮮やかな色に変更）
const SHIFT_COLORS: Record<ShiftType, { bg: string; text: string; border: string }> = {
  早番: { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-600' },
  中番: { bg: 'bg-green-500', text: 'text-white', border: 'border-green-600' },
  遅番: { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-600' },
  休み: { bg: 'bg-gray-300', text: 'text-gray-700', border: 'border-gray-400' },
}

export const PreviewPage = () => {
  const navigate = useTypedNavigate()
  const {
    accessToken,
    events: storeEvents,
    uploadedImage,
    setMessage,
    setEvents: setStoreEvents,
    setCurrentStep,
  } = useAppStore()

  const { registerEvents, loading: isRegistering, error: registerError } = useRegisterEvents()

  const [editableEvents, setEditableEvents] = useState<ShiftEvent[]>(storeEvents)
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false)
  const [openDropdownDate, setOpenDropdownDate] = useState<string | null>(null)

  // 外側クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (openDropdownDate && !target.closest('.relative')) {
        setOpenDropdownDate(null)
      }
    }

    if (openDropdownDate) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [openDropdownDate])

  // カレンダーデータを生成
  const calendarData = useMemo(() => {
    if (editableEvents.length === 0) return null

    // 最初のイベントから年月を取得
    const firstDate = new Date(editableEvents[0].start.split('T')[0])
    const year = firstDate.getFullYear()
    const month = firstDate.getMonth()

    // その月の日数を取得
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // 月の最初の日の曜日を取得（0: 日曜日）
    const firstDayOfWeek = new Date(year, month, 1).getDay()

    // イベントをマップに変換（日付文字列をキーに）
    const eventsMap = new Map<string, ShiftEvent>()
    editableEvents.forEach((event) => {
      const dateStr = event.start.split('T')[0]
      eventsMap.set(dateStr, event)
    })

    return {
      year,
      month,
      daysInMonth,
      firstDayOfWeek,
      eventsMap,
    }
  }, [editableEvents])

  const handleShiftChange = (dateStr: string, newShift: ShiftType) => {
    const timeConfig = SHIFT_TIME_MAP[newShift]

    const existingEventIndex = editableEvents.findIndex((e) => e.start.split('T')[0] === dateStr)

    const newEvent: ShiftEvent = {
      summary: newShift,
      allDay: timeConfig.allDay,
      start: timeConfig.allDay ? dateStr : `${dateStr}T${timeConfig.start}`,
      end: timeConfig.allDay ? dateStr : `${dateStr}T${timeConfig.end}`,
    }

    let newEvents: ShiftEvent[]
    if (existingEventIndex >= 0) {
      // 既存のイベントを更新
      newEvents = [...editableEvents]
      newEvents[existingEventIndex] = newEvent
    } else {
      // 新しいイベントを追加
      newEvents = [...editableEvents, newEvent].sort((a, b) => a.start.localeCompare(b.start))
    }

    setEditableEvents(newEvents)
    setStoreEvents(newEvents) // 自動保存
  }

  const handleDeleteEvent = (dateStr: string) => {
    const newEvents = editableEvents.filter((e) => e.start.split('T')[0] !== dateStr)
    setEditableEvents(newEvents)
    setStoreEvents(newEvents) // 自動保存
  }

  const handleRegister = async () => {
    if (!accessToken) {
      setMessage({ text: 'まずは Google アカウントでログインしてください。', type: 'error' })
      return
    }

    // 休み以外のイベントのみを登録
    const eventsToRegister = editableEvents.filter((event) => event.summary !== '休み')

    if (eventsToRegister.length === 0) {
      setMessage({ text: '登録するイベントがありません。', type: 'error' })
      return
    }

    // ShiftEvent型からShiftEventDTO型に変換
    const eventDTOs: ShiftEventDTO[] = eventsToRegister.map((event) => ({
      id: `temp-${Date.now()}-${Math.random()}`, // 一時的なID (登録前なので)
      summary: event.summary,
      start: event.start,
      end: event.end,
      allDay: event.allDay,
    }))

    // useRegisterEventsフックを使用してイベントを登録
    const result = await registerEvents(eventDTOs, accessToken)

    if (result) {
      const { successCount, failureCount, errors } = result

      if (failureCount === 0) {
        setMessage({ text: `${successCount} 件のイベントを登録しました！`, type: 'success' })
        setCurrentStep('complete')
        setStoreEvents([])
        navigate(ROUTES.COMPLETE)
      } else {
        const errorMessage = errors.length > 0
          ? `${successCount} 件登録しましたが、${failureCount} 件が失敗しました。エラー: ${errors.join(', ')}`
          : `${successCount} 件登録しましたが、${failureCount} 件が失敗しました。`
        setMessage({
          text: errorMessage,
          type: 'error',
        })
      }
    } else if (registerError) {
      // フックからのエラーがある場合
      setMessage({
        text: `エラーが発生しました: ${registerError}`,
        type: 'error',
      })
    }
  }

  if (!calendarData) {
    return (
      <div className="text-center text-gray-600">
        <p>イベントデータがありません。</p>
      </div>
    )
  }

  const { year, month, daysInMonth, firstDayOfWeek, eventsMap } = calendarData

  // カレンダーのグリッドを生成
  const calendarDays: (number | null)[] = []
  // 最初の週の空白セルを追加
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null)
  }
  // 日付を追加
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">確認</h2>
          <p className="text-sm text-gray-600">
            {year}年{month + 1}月のシフト
          </p>
        </div>
        {uploadedImage && (
          <button
            onClick={() => setIsImagePreviewOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all font-medium text-sm flex items-center gap-2"
          >
            <CameraAlt className="w-5 h-5" /> 画像を表示
          </button>
        )}
      </div>

      {/* カレンダービュー */}
      <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
            <div
              key={day}
              className={`p-2 text-center text-sm font-semibold ${
                index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* カレンダーグリッド */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${index}`}
                  className="border border-gray-100 p-2 min-h-20 bg-gray-50"
                />
              )
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(
              2,
              '0'
            )}`
            const event = eventsMap.get(dateStr)
            const shift = event?.summary as ShiftType | undefined
            const dayOfWeek = (firstDayOfWeek + day - 1) % 7

            return (
              <div
                key={dateStr}
                className={`border border-gray-100 p-1 min-h-18 ${
                  dayOfWeek === 0 ? 'bg-red-50' : dayOfWeek === 6 ? 'bg-blue-50' : 'bg-white'
                }`}
              >
                <div
                  className={`text-sm font-semibold mb-1 ${
                    dayOfWeek === 0
                      ? 'text-red-600'
                      : dayOfWeek === 6
                      ? 'text-blue-600'
                      : 'text-gray-700'
                  }`}
                >
                  {day}
                </div>

                <div className="relative">
                  {/* シフトバッジ表示 */}
                  <button
                    onClick={() =>
                      setOpenDropdownDate(openDropdownDate === dateStr ? null : dateStr)
                    }
                    className={`w-full py-1 px-0.5 rounded border-2 transition-all hover:shadow-md font-bold text-xs text-center whitespace-nowrap ${
                      shift
                        ? `${SHIFT_COLORS[shift].bg} ${SHIFT_COLORS[shift].text} ${SHIFT_COLORS[shift].border}`
                        : `${SHIFT_COLORS['休み'].bg} ${SHIFT_COLORS['休み'].text} ${SHIFT_COLORS['休み'].border}`
                    }`}
                  >
                    {shift || '休み'}
                  </button>

                  {/* ドロップダウンメニュー */}
                  {openDropdownDate === dateStr && (
                    <div className="absolute z-10 mt-1 left-0 min-w-10 bg-white border-2 border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      {SHIFT_OPTIONS.map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            if (option === '休み' && shift) {
                              handleDeleteEvent(dateStr)
                            } else {
                              handleShiftChange(dateStr, option)
                            }
                            setOpenDropdownDate(null)
                          }}
                          className={`w-full py-1.5 px-2 text-center transition-colors text-xs font-medium whitespace-nowrap border-2 ${
                            SHIFT_COLORS[option].bg
                          } ${SHIFT_COLORS[option].text} ${SHIFT_COLORS[option].border} ${
                            shift === option
                              ? 'opacity-100 font-bold'
                              : 'opacity-80 hover:opacity-100'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleRegister}
          disabled={isRegistering}
          className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
        >
          {isRegistering ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              登録中...
            </>
          ) : (
            <>
              <CheckCircle /> カレンダーに登録
            </>
          )}
        </button>
      </div>

      {/* 画像プレビューダイアログ */}
      {uploadedImage && (
        <ImagePreviewDialog
          imageUrl={uploadedImage}
          isOpen={isImagePreviewOpen}
          onClose={() => setIsImagePreviewOpen(false)}
        />
      )}
    </div>
  )
}
