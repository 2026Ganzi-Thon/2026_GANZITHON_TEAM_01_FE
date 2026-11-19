import type { ManualSignals } from '../../api/manualSignals'
import { checkInSteps } from './checkInQuestions'

export const walkingOptions = ['2천걸음 이하', '2천~5천 걸음', '5천~8천 걸음', '8천 걸음 이상']

export function activityRanges(signals: ManualSignals | null) {
  const sleepMinutes = signals?.sleepMinutes
  const steps = signals?.steps
  const sleepOptions = checkInSteps[checkInSteps.length - 1].options
  const hours = sleepMinutes == null ? null : Math.floor(sleepMinutes / 60)
  return {
    sleep: hours === null ? '' : sleepOptions[hours <= 4 ? 0 : hours <= 6 ? 1 : hours <= 8 ? 2 : 3],
    walking: steps == null ? '' : walkingOptions[steps <= 2000 ? 0 : steps < 5000 ? 1 : steps < 8000 ? 2 : 3],
  }
}

export function readCheckInActivity(loginId: string, date: string) {
  try {
    const record = JSON.parse(localStorage.getItem(`check-in-activity:${loginId}`) ?? 'null')
    if (record?.date === date && typeof record.sleep === 'string' && typeof record.walking === 'string') {
      return { sleep: record.sleep as string, walking: record.walking as string }
    }
  } catch {
    // Server answers remain available if browser storage is unavailable.
  }
  return { sleep: '', walking: '' }
}

export function saveCheckInActivity(loginId: string, date: string, sleep: string, walking: string) {
  try {
    localStorage.setItem(`check-in-activity:${loginId}`, JSON.stringify({ date, sleep, walking }))
  } catch {
    // The check-in itself has already been saved on the server.
  }
}
