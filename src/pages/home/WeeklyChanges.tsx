import weeklySheep from '../../assets/image/sheep_3.png'
import '../../styles/home/WeeklyChanges.css'

const weeklyBars = [
  { day: '월', height: 28 },
  { day: '화', height: 40 },
  { day: '수', height: 30 },
  { day: '목', height: 70, highlighted: true },
  { day: '금', height: 38 },
  { day: '토', height: 58 },
  { day: '일', height: 28 },
]

export default function WeeklyChanges({ onOpenRoutine }: { onOpenRoutine: () => void }) {
  return (
    <div className="weekly-changes">
      <h1>이번 주 소미의 털 무게</h1>
      <div className="weekly-changes__summary">
        <img src={weeklySheep} width="165" height="190" alt="소미" />
        <div>
          <p className="weekly-changes__weight">3.2kg</p>
          <h2>피로가 쌓였어요</h2>
          <p>오늘은 나를 먼저 돌봐주세요.</p>
        </div>
      </div>

      <section className="weekly-changes__fatigue" aria-labelledby="weekly-fatigue-title">
        <p className="weekly-changes__average">2.4 / 4</p>
        <h2 id="weekly-fatigue-title">이번 주 평균 피로도</h2>
        <div className="weekly-changes__chart" role="img" aria-label="월요일부터 일요일까지의 피로도. 목요일이 가장 높아요.">
          {weeklyBars.map(({ day, height, highlighted }) => (
            <div className="weekly-changes__day" key={day} aria-hidden="true">
              <span className="weekly-changes__bar" style={{ height }} data-highlighted={highlighted || undefined} />
              <span>{day}</span>
            </div>
          ))}
        </div>
      </section>

      <button className="weekly-changes__routine" type="button" onClick={onOpenRoutine}>
        <span>
          <strong>오늘도 조금 덜어낼까요?</strong>
          <span>나에게 맞는 회복 루틴 살펴보기</span>
        </span>
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="m8 3 8 8-8 8" stroke="currentColor" strokeWidth="3" />
        </svg>
      </button>
    </div>
  )
}
