import type { ReactNode } from 'react'
import type { WeeklyInsights } from '../../api/home'
import '../../styles/home/WeeklyChanges.css'

const weekday = new Intl.DateTimeFormat('ko-KR', { weekday: 'short', timeZone: 'UTC' })
const measurement = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 2 })
const maxLevel = 4

export default function WeeklyChanges({ data, sheepImage, loadStatus, onOpenRoutine }: {
  data: WeeklyInsights | null
  sheepImage: string
  loadStatus: ReactNode
  onOpenRoutine: () => void
}) {
  const bars = data?.days.map(({ localDate, level }) => ({
    localDate,
    day: weekday.format(new Date(`${localDate}T00:00:00Z`)),
    level,
  })) ?? []

  return (
    <div className="weekly-changes">
      <h1>이번 주 소미의 털 무게</h1>
      {!data ? (
        <div className="weekly-changes__status">{loadStatus}</div>
      ) : (
        <>
          <div className="weekly-changes__summary">
            <img src={sheepImage} width="165" height="190" alt="소미" />
            <div>
              {data.woolWeightKg !== null && <p className="weekly-changes__weight">{measurement.format(data.woolWeightKg)}kg</p>}
              {data.levelText && <h2>{data.levelText}</h2>}
              {data.recordedDays === 0 ? <p>이번 주에 기록된 양 레벨이 없어요.</p> : data.changeSummary && <p>{data.changeSummary}</p>}
            </div>
          </div>

          <section className="weekly-changes__fatigue" aria-labelledby="weekly-fatigue-title">
            <div>
              <p className="weekly-changes__average">
                {data.averageLevel === null ? '–' : `${measurement.format(data.averageLevel)} / ${maxLevel}`}
              </p>
              <h2 id="weekly-fatigue-title">이번 주 평균 피로도</h2>
            </div>
            <div className="weekly-changes__chart" role="img" aria-label={bars.map(({ day, level }) => (
              `${day}요일 ${level === null ? '기록 없음' : `${level}단계`}`
            )).join(', ')}>
              {bars.map(({ localDate, day, level }) => (
                <div className="weekly-changes__day" key={localDate} aria-hidden="true">
                  <span
                    className="weekly-changes__bar"
                    style={{ height: level === null ? 0 : (level / maxLevel) * 70 }}
                    data-highlighted={level !== null && localDate === data.heaviestDate || undefined}
                  />
                  <span>{day}</span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <button className="weekly-changes__routine" type="button" onClick={onOpenRoutine}>
        <span>
          <strong>오늘도 조금 덜어낼까요?</strong>
          <span>나에게 맞는 회복 루틴 살펴보기</span>
        </span>
        <svg aria-hidden="true" width="9" height="15" viewBox="0 0 9 15">
          <path d="M1.5 0 9 7.5 1.5 15 0 13.5 6 7.5 0 1.5Z" />
        </svg>
      </button>
    </div>
  )
}
