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
