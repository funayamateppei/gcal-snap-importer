import type { ShiftEvent } from '../types'

export const mockShiftEvents: ShiftEvent[] = [
  {
    summary: '早番',
    start: '2026-01-11T09:00:00+09:00',
    end: '2026-01-11T17:00:00+09:00',
    allDay: false,
  },
  {
    summary: '中番',
    start: '2026-01-12T11:00:00+09:00',
    end: '2026-01-12T19:00:00+09:00',
    allDay: false,
  },
  {
    summary: '遅番',
    start: '2026-01-13T13:00:00+09:00',
    end: '2026-01-13T21:00:00+09:00',
    allDay: false,
  },
]
