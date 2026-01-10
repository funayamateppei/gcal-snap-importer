import type { GoogleCalendarEvent } from '../types'

export const insertCalendarEvent = async (accessToken: string, event: GoogleCalendarEvent) => {
  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error?.message || 'Failed to create event')
  }

  return response.json()
}

export const insertCalendarEventsBatch = async (
  accessToken: string,
  events: GoogleCalendarEvent[]
) => {
  const boundary = 'batch_' + Math.random().toString(36).substring(2)

  // バッチリクエストのボディを構築
  const batchBody = events
    .map((event, index) => {
      const requestBody = JSON.stringify(event)
      return [
        `--${boundary}`,
        'Content-Type: application/http',
        `Content-ID: <item${index}>`,
        '',
        'POST /calendar/v3/calendars/primary/events',
        'Content-Type: application/json',
        '',
        requestBody,
      ].join('\r\n')
    })
    .join('\r\n')

  const fullBody = `${batchBody}\r\n--${boundary}--`

  const response = await fetch('https://www.googleapis.com/batch/calendar/v3', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/mixed; boundary=${boundary}`,
    },
    body: fullBody,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Batch request failed: ${errorText}`)
  }

  const responseText = await response.text()

  // バッチレスポンスをパース
  const results: { success: boolean; error?: string }[] = []
  const responseParts = responseText.split(/--batch_[\w]+/)

  for (const part of responseParts) {
    if (part.includes('HTTP/1.1')) {
      const statusMatch = part.match(/HTTP\/1\.1 (\d+)/)
      if (statusMatch) {
        const status = parseInt(statusMatch[1])
        if (status >= 200 && status < 300) {
          results.push({ success: true })
        } else {
          const errorMatch = part.match(/"message":\s*"([^"]+)"/)
          results.push({
            success: false,
            error: errorMatch ? errorMatch[1] : `HTTP ${status}`
          })
        }
      }
    }
  }

  return results
}
