export interface ShiftEvent {
  summary: string
  start: string // ISO string
  end: string // ISO string
  allDay: boolean
  description?: string
  location?: string
}

export type ParseStatus = 'idle' | 'parsing' | 'success' | 'error'

export interface AppState {
  apiKey: string | null
  events: ShiftEvent[]
  status: ParseStatus
  error: string | null
}

export interface GoogleCalendarEvent {
  summary: string
  start: {
    dateTime?: string
    date?: string
  }
  end: {
    dateTime?: string
    date?: string
  }
  description?: string
}
