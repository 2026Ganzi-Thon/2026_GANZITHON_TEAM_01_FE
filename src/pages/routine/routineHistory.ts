import type { JournalEntry, RoutinesToday } from '../../api/routines'

export type RoutineOverview = { today: RoutinesToday; journals: JournalEntry[] }
type RoutineDay = Pick<RoutinesToday, 'level' | 'routines'> & { reflectionCount: number }
type RoutineHistory = Record<string, RoutineDay>

export function readRoutineHistory(loginId: string): RoutineHistory {
  try {
    return JSON.parse(localStorage.getItem(`routine-history:${loginId}`) ?? '{}') ?? {}
  } catch {
    return {}
  }
}

export function countReflection(entries: JournalEntry[]) {
  return Number(entries.some(({ emotion }) => Boolean(emotion))) + Number(entries.some(({ text }) => Boolean(text?.trim())))
}

export function saveRoutineHistory(loginId: string, { today, journals }: RoutineOverview) {
  const history = readRoutineHistory(loginId)
  history[today.localDate] = {
    level: today.level,
    routines: today.routines,
    reflectionCount: countReflection(journals),
  }
  const dates = Object.keys(history).sort().slice(-14)
  const recent = Object.fromEntries(dates.map((date) => [date, history[date]]))
  try {
    localStorage.setItem(`routine-history:${loginId}`, JSON.stringify(recent))
  } catch {
    // Today's progress is still available from the API.
  }
  return recent
}
