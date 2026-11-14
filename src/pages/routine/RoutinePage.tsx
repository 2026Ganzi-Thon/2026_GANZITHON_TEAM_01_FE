import { useEffect, useState } from 'react'
import check from '../../assets/icon/check.png'
import checkDone from '../../assets/icon/check_done.png'
import clock from '../../assets/icon/clock.png'
import heart from '../../assets/icon/heart.png'
import lock from '../../assets/icon/lock.png'
import pen from '../../assets/icon/pen.png'
import sheep from '../../assets/image/sheep_3.png'
import step1 from '../../assets/image/routine_step1.png'
import step2 from '../../assets/image/routine_step2.png'
import step3 from '../../assets/image/routine_step3.png'
import step4 from '../../assets/image/routine_step4.png'
import background1 from '../../assets/image/routine_step1_background.png'
import background2 from '../../assets/image/routine_step2_background.png'
import background3 from '../../assets/image/routine_step3_background.png'
import background4 from '../../assets/image/routine_step4_background.png'
import RoutineExercise from './RoutineExercise'
import RoutineReflection from './RoutineReflection'
import { CheckInComplete } from '../home/CheckIn'
import '../../styles/routine/RoutinePage.css'

const description = '호흡에 집중하여 마음 가라앉히기'
const recommended = [
  { id: 'breathing', title: '숨 고르기', image: step1, background: background1, seconds: 60, guide: '의자에 앉아 한 손을 배에 두고,\n코로 5초 들이 쉬고\n입으로 5초 내쉽니다', repeat: '5회 반복하세요!' },
  { id: 'shoulders', title: '어깨 천천히 돌리기', image: step2, background: background2, seconds: 30, guide: '어깨를 귀 쪽으로 올렸다가\n뒤로 크게 돌려 내립니다', repeat: '앞 뒤 각각 8회 천천히\n호흡하며 합니다.' },
  { id: 'twist', title: '의자에 앉아 허리 비틀기', image: step3, background: background3, seconds: 30, guide: '의자에 앉아 발을 바닥에 두고,\n상체를 한쪽으로 천천히 돌립니다.\n반대쪽도 같은 방법으로 합니다.', repeat: '2회 반복하세요!' },
  { id: 'stretch', title: '손목, 팔 스트레칭', image: step4, background: background4, seconds: 30, guide: '한 팔을 앞으로 뻗고 손바닥을\n아래로 한 뒤,\n다른 손으로 손가락을 몸쪽으로\n당겨 팔 안쪽을 늘립니다', repeat: '2회 반복하세요!' },
]

const reflections = [
  { id: 'mood', title: '마음 상태 확인', image: heart },
  { id: 'journal', title: '마음 일기 쓰기', image: pen },
]

const activities = [...recommended, ...reflections]
const weekdays = ['월', '화', '수', '목', '금', '토', '일']
const storageKey = 'routine-completed'

function dateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

function readProgress(): Record<string, string[]> {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '{}')
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
      return Object.fromEntries(Object.entries(saved).filter(([, ids]) =>
        Array.isArray(ids) && ids.every((id) => typeof id === 'string'),
      ))
    }
  } catch {
    // Progress can still be tracked while the screen is open.
  }
  return {}
}

export default function RoutinePage({ onHome }: { onHome: (allCompleted: boolean) => void }) {
  const [progress, setProgress] = useState(readProgress)
  const [active, setActive] = useState<{ activity: (typeof activities)[number]; day: string } | null>(null)
  const [mood, setMood] = useState('')
  const [journal, setJournal] = useState('')
  const [reflectionComplete, setReflectionComplete] = useState(false)
  const [today, setToday] = useState(() => new Date())
  const todayKey = dateKey(today)
  const completed = progress[todayKey] ?? []
  const unlocked = recommended.every(({ id }) => completed.includes(id))
  const monday = today.getDate() - (today.getDay() + 6) % 7

  useEffect(() => {
    function updateDate() {
      const now = new Date()
      setToday((current) => dateKey(current) === dateKey(now) ? current : now)
    }
    const timer = window.setInterval(updateDate, 30_000)
    window.addEventListener('focus', updateDate)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', updateDate)
    }
  }, [])

  function saveProgress(day: string, ids: string[]) {
    const next = { ...progress, [day]: ids }
    setProgress(next)
    try {
      localStorage.setItem(storageKey, JSON.stringify(next))
    } catch {
      // Keep the current completion in state if storage is unavailable.
    }
  }

  function finishActivity(nextActivity?: (typeof recommended)[number], completedIds?: string[]) {
    if (!active) return
    const previous = progress[active.day] ?? []
    const updated = [...new Set([...previous, ...(completedIds ?? [active.activity.id])])]
    if (updated.length > previous.length) saveProgress(active.day, updated)
    setActive(nextActivity ? { activity: nextActivity, day: active.day } : null)
  }

  const exerciseIndex = recommended.findIndex(({ id }) => id === active?.activity.id)
  const exercise = recommended[exerciseIndex]
  if (active && exercise) {
    return (
      <RoutineExercise
        key={exercise.id}
        exercise={exercise}
        index={exerciseIndex}
        count={recommended.length}
        onBack={(finished) => finishActivity(undefined, finished ? [exercise.id] : [])}
        onPrevious={exerciseIndex > 0 ? (finished) => finishActivity(recommended[exerciseIndex - 1], finished ? [exercise.id] : []) : undefined}
        onNext={() => finishActivity(recommended[exerciseIndex + 1])}
      />
    )
  }

  if (active && reflectionComplete) {
    return (
      <main className="routine-reflection-complete">
        <CheckInComplete
          title="오늘도 한 겹 덜어냈어요!"
          onPrevious={() => setReflectionComplete(false)}
          onHome={() => onHome(activities.every(({ id }) => progress[active.day]?.includes(id)))}
        />
      </main>
    )
  }

  if (active) {
    return (
      <RoutineReflection
        mood={mood}
        journal={journal}
        onBack={() => setActive(null)}
        onComplete={(nextMood, nextJournal) => {
          setMood(nextMood)
          setJournal(nextJournal)
          const completedIds = (progress[active.day] ?? []).filter((id) => id !== 'mood' && id !== 'journal')
          if (nextMood) completedIds.push('mood')
          if (nextJournal.trim()) completedIds.push('journal')
          saveProgress(active.day, completedIds)
          if (nextMood && nextJournal.trim()) setReflectionComplete(true)
          else setActive(null)
        }}
      />
    )
  }

  function renderActivity(activity: (typeof activities)[number], isRecommended: boolean) {
    const done = completed.includes(activity.id)
    const locked = !isRecommended && !unlocked
    return (
      <button
        className="routine-card"
        data-completed={done}
        disabled={locked}
        key={activity.id}
        type="button"
        onClick={() => setActive({ activity, day: todayKey })}
      >
        {isRecommended ? (
          <span className="routine-thumbnail" style={{ backgroundImage: `url(${activity.image})` }} />
        ) : (
          <span className="routine-reflection-icon"><img src={activity.image} alt="" /></span>
        )}
        <span className="routine-card-copy">
          <strong>{activity.title}</strong>
          {isRecommended && <>
            <span>{description}</span>
            <span className="routine-duration"><img src={clock} alt="" width="15" height="15" />{'seconds' in activity && activity.seconds === 30 ? '30초' : '1분'}</span>
          </>}
        </span>
        {locked ? (
          <img src={lock} alt="잠김" width="16" height="20" />
        ) : (
          <img src={done ? checkDone : check} alt={done ? '완료' : '미완료'} width="18" height="18" />
        )}
      </button>
    )
  }

  return (
    <main className="routine-page" key="overview">
      <header className="routine-intro">
        <h1>오늘은 조금 덜어내 볼까요?</h1>
        <p>지금 나에게 필요한 작은 쉼을 선택하세요</p>
      </header>

      <ol className="routine-week" aria-label="이번 주 루틴 완료 현황">
        {weekdays.map((weekday, index) => {
          const date = new Date(today.getFullYear(), today.getMonth(), monday + index)
          const key = dateKey(date)
          const count = activities.filter(({ id }) => progress[key]?.includes(id)).length
          return (
            <li key={weekday} aria-current={key === todayKey ? 'date' : undefined} aria-label={`${date.getDate()}일 ${weekday}요일, ${activities.length}개 중 ${count}개 완료`}>
              <span className="routine-day" style={count ? {
                backgroundColor: `hsl(10.5495deg 86.6667% 79.4118% / ${count / activities.length})`,
                color: '#fff',
              } : undefined}>{date.getDate()}</span>
              <span>{weekday}</span>
            </li>
          )
        })}
      </ol>

      <section className="routine-status" aria-label="오늘의 상태">
        <div className="routine-sheep"><img src={sheep} alt="" width="44" height="51" /></div>
        <div className="routine-status-copy">
          <div className="routine-status-label"><span>오늘의 상태</span><span>2단계</span></div>
          <strong>조금 지쳐있는 상태예요.</strong>
          <p>가벼운 회복 루틴을 추천해요</p>
        </div>
      </section>

      <section className="routine-section" aria-labelledby="routine-recommended">
        <div className="routine-section-heading">
          <h2 id="routine-recommended">오늘의 추천 루틴</h2>
          <span>{recommended.length}가지</span>
        </div>
        <div className="routine-cards">{recommended.map((activity) => renderActivity(activity, true))}</div>
      </section>

      <section className="routine-section routine-reflections" aria-labelledby="routine-reflections">
        <div className="routine-section-heading">
          <div>
            <h2 id="routine-reflections">마음 정리하기</h2>
            <p>오늘의 추천 루틴을 모두 완료하면 잠금이 풀려요</p>
          </div>
          <span>{reflections.length}가지</span>
        </div>
        <div className="routine-cards">{reflections.map((activity) => renderActivity(activity, false))}</div>
      </section>
    </main>
  )
}
