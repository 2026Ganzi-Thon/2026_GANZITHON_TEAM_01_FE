import { readApi } from './client'
import type { WeeklyInsights } from './home'

export function getInsights(days: 7 | 30, signal: AbortSignal) {
  return readApi<WeeklyInsights>(`/insights?days=${days}`, '털 무게 기록 불러오기', signal)
}
