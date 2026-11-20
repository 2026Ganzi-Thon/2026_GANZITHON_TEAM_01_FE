import { getCurrentUser } from './api/auth'
import { ApiError } from './api/client'
import { syncGoogleCalendar } from './api/googleCalendar'

export type CalendarCallbackResult = {
  status: 'success' | 'cancelled' | 'error'
  loginId?: string
  message?: string
}

const callbackPath = '/google-callback'

async function completeCallback(params: URLSearchParams): Promise<CalendarCallbackResult> {
  let loginId: string | undefined
  try {
    ({ loginId } = await getCurrentUser(AbortSignal.timeout(10_000)))
    if (!loginId) return { status: 'error', message: '다시 로그인한 뒤 캘린더를 연결해 주세요.' }

    if (params.get('error') === 'access_denied') return { status: 'cancelled', loginId }
    if (params.has('error')) return { status: 'error', loginId }

    const code = params.get('code')
    const state = params.get('state')
    if (!code || !state) return { status: 'error', loginId, message: '연결 요청을 찾을 수 없어요. 다시 연결해 주세요.' }

    await syncGoogleCalendar({ code, state })
    return { status: 'success', loginId }
  } catch (error) {
    if (!loginId || (error instanceof ApiError && error.status === 401)) {
      return { status: 'error', message: '로그인 상태를 확인할 수 없어요. 다시 로그인한 뒤 연결해 주세요.' }
    }
    return { status: 'error', loginId }
  }
}

export function readGoogleCalendarCallback() {
  const { pathname, search } = window.location
  if (pathname !== callbackPath && pathname !== `${callbackPath}/`) return undefined

  const params = new URLSearchParams(search)
  window.history.replaceState(window.history.state, '', callbackPath)
  return completeCallback(params)
}
