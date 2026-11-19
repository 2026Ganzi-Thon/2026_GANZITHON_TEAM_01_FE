import { useEffect, useState } from 'react'
import { ApiError } from '../../api/client'
import { saveRequiredConsents } from '../../api/consents'
import { getInsights } from '../../api/my'
import type { WeeklyInsights } from '../../api/home'
import ConsentPage from '../auth/ConsentPage'
import '../../styles/my/MyPage.css'

const menus = ['데이터 연결 관리', '알림 설정', '개인정보 및 데이터 삭제']
const weekdays = new Intl.DateTimeFormat('ko-KR', { weekday: 'short', timeZone: 'UTC' })
const dates = new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric', timeZone: 'UTC' })
const numbers = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 2 })

function displayDate(date: string, formatter: Intl.DateTimeFormat = dates) {
  return formatter.format(new Date(date + 'T00:00:00Z'))
}

function weekdayIndex(date: string) {
  return (new Date(date + 'T00:00:00Z').getUTCDay() + 6) % 7
}

export default function MyPage() {
  const [period, setPeriod] = useState<7 | 30>(7)
  const [insights, setInsights] = useState<WeeklyInsights>()
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [needsConsent, setNeedsConsent] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (needsConsent) return
    const controller = new AbortController()
    void getInsights(period, controller.signal).then((data) => {
      if (!controller.signal.aborted) setInsights(data)
    }, (error: unknown) => {
      if (controller.signal.aborted) return
      if (error instanceof ApiError && error.code === 'CONSENT_REQUIRED') setNeedsConsent(true)
      else setError(error instanceof ApiError ? error.message : '털 무게 기록을 불러오지 못했어요.')
    })
    return () => controller.abort()
  }, [needsConsent, period, retry])

  async function saveConsent() {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      await saveRequiredConsents()
      setNeedsConsent(false)
    } catch (error) {
      setError(error instanceof ApiError ? error.message : '필수 동의를 저장하지 못했어요.')
    } finally {
      setBusy(false)
    }
  }

  if (needsConsent) return <ConsentPage onContinue={saveConsent} isSubmitting={busy} error={error} />

  const chart = insights?.days ?? []
  const orderedDays = [...chart].sort((first, second) => period === 7
    ? weekdayIndex(first.localDate) - weekdayIndex(second.localDate)
    : first.localDate.localeCompare(second.localDate))
  const firstColumn = period === 30 && orderedDays.length ? weekdayIndex(orderedDays[0].localDate) : 0
  const chartColumns = period === 7 ? 7 : Math.ceil((firstColumn + orderedDays.length) / 7) * 7
  const maxWeight = Math.max(1, ...chart.map(({ woolDisplayKg }) => woolDisplayKg ?? 0))

  return (
    <main className="my-page">
      <h1>마이</h1>

      <section className="my-page__card my-page__records" aria-labelledby="my-records-title">
        <header className="my-page__records-header">
          <h2 id="my-records-title">나의 털 무게</h2>
          <div className="my-page__period" role="group" aria-label="기록 기간">
            {([7, 30] as const).map((days) => (
              <button key={days} type="button" aria-pressed={period === days} onClick={() => {
                if (period === days) return
                setInsights(undefined)
                setError('')
                setPeriod(days)
              }}>
                {days}일
              </button>
            ))}
          </div>
        </header>
        {error ? (
          <div className="my-page__empty">
            <p className="my-page__note" role="alert">{error}</p>
            <button type="button" onClick={() => { setError(''); setRetry((value) => value + 1) }}>다시 불러오기</button>
          </div>
        ) : !insights ? <p className="my-page__note my-page__empty" role="status">기록을 불러오는 중이에요.</p>
          : !insights.recordedDays ? <p className="my-page__note my-page__empty">기록 없음</p> : (
          <>
            <div className="my-page__chart" data-long={period === 30 || undefined}
              style={{ gridTemplateColumns: 'repeat(' + chartColumns + ', minmax(0, 1fr))' }}
              role="img" aria-label={orderedDays.map(({ localDate, woolDisplayKg }) =>
                displayDate(localDate) + ' ' + (woolDisplayKg === null ? '기록 없음' : numbers.format(woolDisplayKg) + 'kg'),
              ).join(', ')}
            >
              {orderedDays.map(({ localDate, woolDisplayKg }, index) => {
                const date = new Date(localDate + 'T00:00:00Z')
                const label = period === 7 ? displayDate(localDate, weekdays)
                  : index === 0 || weekdayIndex(localDate) === 0 || index === orderedDays.length - 1 ? String(date.getUTCDate()) : ''
                const height = woolDisplayKg === null ? 0 : Math.max(2, (woolDisplayKg / maxWeight) * 128)
                return (
                  <div className="my-page__day" key={localDate} aria-hidden="true"
                    style={{ gridColumn: period === 7 ? weekdayIndex(localDate) + 1 : firstColumn + index + 1 }}
                    title={displayDate(localDate) + ' ' + (woolDisplayKg === null ? '기록 없음' : numbers.format(woolDisplayKg) + 'kg')}>
                    <span className="my-page__bar" style={{ height }} data-peak={localDate === insights.heaviestDate || undefined} />
                    <span>{label}</span>
                  </div>
                )
              })}
            </div>
            <div className="my-page__chart-note">
              {insights.heaviestDate && <p>가장 무거웠던 날은 {displayDate(insights.heaviestDate, weekdays)}요일이에요.</p>}
              {(insights.heaviestReason || insights.changeSummary) && <p>{insights.heaviestReason || insights.changeSummary}</p>}
            </div>
          </>
        )}
      </section>

      <section className="my-page__card my-page__settings" aria-label="설정">
        {menus.map((label) => (
          <div className="my-page__menu" key={label}>
            {label}
            <span className="my-page__chevron" aria-hidden="true" />
          </div>
        ))}
        <a className="my-page__menu my-page__help-button" href="#help">
          <span>
            도움 받을 곳
            <span className="my-page__note">전문 상담 연결 안내</span>
          </span>
          <span className="my-page__chevron" aria-hidden="true" />
        </a>
      </section>
    </main>
  )
}
