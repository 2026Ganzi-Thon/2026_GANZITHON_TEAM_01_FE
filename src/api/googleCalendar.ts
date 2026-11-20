import { writeApi } from './client'

type CalendarCallback = { code: string; state: string }

export async function requestGoogleCalendarAuthorization() {
  await writeApi('/me/connections/CALENDAR_PERSONAL', '캘린더 동의 저장', {})
  const response = await writeApi('/me/google-calendar/authorize', '구글 캘린더 연결 시작', {})
  const result = await response.json().catch(() => null)
  const address = result?.authorizationUrl

  if (typeof address === 'string' && URL.canParse(address)) {
    const url = new URL(address)
    if (url.origin === 'https://accounts.google.com' && url.pathname === '/o/oauth2/v2/auth'
      && !url.username && !url.password) {
      if (!url.searchParams.has('prompt')) url.searchParams.set('prompt', 'select_account')
      return url.href
    }
  }
  throw new Error('구글 캘린더 동의 화면을 열 수 없어요. 다시 시도해 주세요.')
}

export async function syncGoogleCalendar(callback: CalendarCallback) {
  await writeApi('/me/google-calendar/sync', '구글 캘린더 동기화', callback)
}
