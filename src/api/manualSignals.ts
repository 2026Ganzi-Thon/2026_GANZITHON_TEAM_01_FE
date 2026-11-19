import { readApi } from './client'

export type ManualSignals = {
  sleepMinutes: number | null
  steps: number | null
}

export function getManualSignals(date: string, signal: AbortSignal) {
  return readApi<ManualSignals>(`/me/manual-signals/${date}`, '수면·걸음 수 불러오기', signal)
}

