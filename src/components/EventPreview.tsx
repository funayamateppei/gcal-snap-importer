import { useState } from 'react'
import { CalendarToday, CheckCircle } from '@mui/icons-material'
import type { ShiftEvent } from '../types'
import { format, parseISO } from 'date-fns'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { ja } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = dateFnsLocalizer({
  format,
  parse: parseISO,
  startOfWeek: () => 0,
  getDay: (date: Date) => date.getDay(),
  locales: { ja },
})

interface Props {
  events: ShiftEvent[]
  onRegister: () => void
  isRegistering: boolean
}

type ViewMode = 'list' | 'calendar'

export const EventPreview = ({ events, onRegister, isRegistering }: Props) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  if (events.length === 0) return null

  // react-big-calendar用のイベント形式に変換
  const calendarEvents = events.map((event, idx) => ({
    id: idx,
    title: event.summary,
    start: parseISO(event.start),
    end: parseISO(event.end),
    allDay: event.allDay,
  }))

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <CalendarToday className="text-green-500" /> プレビュー
            <span className="text-sm font-normal text-gray-500 ml-2">({events.length} 件検出)</span>
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              リスト表示
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg transition-all ${
                viewMode === 'calendar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              カレンダー表示
            </button>
          </div>
        </div>
        <button
          onClick={onRegister}
          disabled={isRegistering}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed active:transform active:scale-95 transition-all font-medium shadow-sm flex items-center gap-2"
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

      {viewMode === 'list' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-3">日付</th>
                <th className="p-3">時間</th>
                <th className="p-3">予定</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {events.map((event, idx) => {
                const startDate = parseISO(event.start)
                const endDate = parseISO(event.end)
                return (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-medium text-gray-700">
                      {format(startDate, 'yyyy-MM-dd (EEE)', { locale: ja })}
                    </td>
                    <td className="p-3 text-gray-600">
                      {event.allDay
                        ? '終日'
                        : `${format(startDate, 'HH:mm')} - ${format(endDate, 'HH:mm')}`}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-1 rounded text-sm font-medium
                                ${
                                  event.summary === '早番'
                                    ? 'bg-blue-100 text-blue-800'
                                    : event.summary === '中番'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : event.summary === '遅番'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                      >
                        {event.summary}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-[600px]">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            culture="ja"
            messages={{
              next: '次へ',
              previous: '前へ',
              today: '今日',
              month: '月',
              week: '週',
              day: '日',
              agenda: '予定',
            }}
          />
        </div>
      )}
    </div>
  )
}
