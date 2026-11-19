import { readApi, writeApi } from './client'

type RoutineStatus = 'NOT_STARTED' | 'STARTED' | 'COMPLETED' | 'SKIPPED'

export type RoutineItem = {
  routineId: string
  title: string
  subtitle: string
  instruction: string
  durationSec: number
  status: RoutineStatus
}

export type RoutinesToday = {
  localDate: string
  level: number | null
  week: { localDate: string; done: boolean | null }[]
  routines: RoutineItem[]
  journalUnlocked: boolean
}

export const journalMoods = {
  ANXIOUS: '불안함',
  FRUSTRATED: '답답함',
  TIRED: '피곤함',
  LETHARGIC: '무기력함',
  OKAY: '괜찮음',
} as const

export type JournalEmotion = keyof typeof journalMoods

export type JournalEntry = {
  localDate: string
  emotion: JournalEmotion | null
  text: string | null
}

export function getRoutinesToday(signal: AbortSignal) {
  return readApi<RoutinesToday>('/routines/today', '루틴 불러오기', signal)
}

export function getJournal(date: string, signal: AbortSignal) {
  return readApi<JournalEntry[]>(`/journal?${new URLSearchParams({ date })}`, '마음 기록 불러오기', signal)
}

export async function changeRoutine(routineId: string, action: 'start' | 'complete' | 'skip'): Promise<{
  localDate: string
  status: RoutineStatus
}> {
  const response = await writeApi(`/routines/${encodeURIComponent(routineId)}/${action}`, '루틴 기록 저장', {})
  return response.json()
}

export async function writeJournal(emotion: JournalEmotion | null, text: string): Promise<JournalEntry> {
  const response = await writeApi('/journal', '마음 기록 저장', { emotion, text }, { expectedStatus: 201 })
  return response.json()
}
