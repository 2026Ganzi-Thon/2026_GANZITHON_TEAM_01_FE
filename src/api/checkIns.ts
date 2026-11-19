import { ApiError, readApi, writeApi } from './client'
import type { buildCheckInRequest } from '../pages/home/checkInQuestions'

export type SavedCheckIn = {
  localDate: string
  mood: string | null
  stressors: string[]
  supportNeed: string | null
}

export async function getCheckIn(date: string, signal: AbortSignal) {
  try {
    return await readApi<SavedCheckIn>(`/checkins?date=${date}`, '오늘 체크인 조회', signal)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

export async function submitCheckIn(input: ReturnType<typeof buildCheckInRequest>, idempotencyKey: string) {
  const response = await writeApi('/checkins', '하루 체크인 저장', input, { idempotencyKey })
  const { status, localDate } = (await response.json().catch(() => null)) ?? {}
  if ((status !== 'SUBMITTED' && status !== 'SKIPPED') || typeof localDate !== 'string') {
    throw new Error('체크인 저장 결과를 확인할 수 없어요. 다시 시도해 주세요.')
  }
  return { status, localDate }
}
