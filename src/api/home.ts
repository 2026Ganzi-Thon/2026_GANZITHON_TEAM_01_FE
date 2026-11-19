import { readApi } from './client'

export type TodayState = {
  localDate: string
  level: number | null
  assetKey: string | null
  isStale: boolean
  bubbleText: string | null
  statusText: string | null
}

export type WeeklyInsights = {
  days: { localDate: string; level: number | null; woolDisplayKg: number | null }[]
  averageLevel: number | null
  recordedDays: number
  changeSummary: string | null
  heaviestDate: string | null
  heaviestReason: string | null
  woolWeightKg: number | null
  levelText: string | null
}

export function getTodayState(signal: AbortSignal) {
  return readApi<TodayState>('/state/today', '오늘의 양 레벨 조회', signal)
}

export function getWeeklyInsights(signal: AbortSignal) {
  return readApi<WeeklyInsights>('/insights/week', '이번 주 변화 조회', signal)
}
