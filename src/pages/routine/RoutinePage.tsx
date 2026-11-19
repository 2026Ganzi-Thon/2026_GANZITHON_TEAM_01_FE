import { useEffect, useRef, useState } from 'react'
import { changeRoutine, getJournal, getRoutinesToday, journalMoods, writeJournal, type JournalEmotion, type JournalEntry, type RoutineItem, type RoutineTarget } from '../../api/routines'
import { ApiError } from '../../api/client'
import { getTodayState, type TodayState } from '../../api/home'
import { saveRequiredConsents } from '../../api/consents'
import { todayInSeoul } from '../../serviceDate'
import clock from '../../assets/icon/clock.png'
import heart from '../../assets/icon/heart.png'
import pen from '../../assets/icon/pen.png'
import completedSheep from '../../assets/image/checkin_sheeep.png'
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
import ConsentPage from '../auth/ConsentPage'
import { countReflection, readRoutineHistory, saveRoutineHistory, type RoutineOverview } from './routineHistory'

const visuals: Record<string, { image: string; background: string }> = {
  BREATHING: { image: step1, background: background1 },
  SHOULDER_ROLL: { image: step2, background: background2 },
  SEATED_TWIST: { image: step3, background: background3 },
  WRIST_ARM_STRETCH: { image: step4, background: background4 },
}
const reflections = [
  { id: 'mood', title: '마음 상태 확인', image: heart },
  { id: 'journal', title: '마음 일기 쓰기', image: pen },
]
const weekdays = ['월', '화', '수', '목', '금', '토', '일']
const activityCount = 6

function completedCount(routines: RoutineItem[], reflectionCount: number) {
  return routines.filter(({ status }) => status === 'COMPLETED').length + reflectionCount
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback
}

function findRecommendedRoutine(routines: RoutineItem[], target: RoutineTarget) {
  const byId = routines.find(({ routineId }) => routineId === target.routineId)
  if (byId) return byId
  const title = target.title.trim().normalize('NFC')
  const matches = routines.filter((routine) => routine.title.trim().normalize('NFC') === title)
  return matches.length === 1 ? matches[0] : undefined
}

async function recordRoutineStart(routine: RoutineItem) {
  if (routine.status === 'COMPLETED' || routine.status === 'STARTED') return
  await changeRoutine(routine.routineId, 'start')
}

export default function RoutinePage({ loginId, initialRoutine, onHome }: {
  loginId: string
  initialRoutine?: RoutineTarget
  onHome: () => void
}) {
  const [overview, setOverview] = useState<RoutineOverview>()
  const [todayState, setTodayState] = useState<TodayState>()
  const [history, setHistory] = useState(() => readRoutineHistory(loginId))
  const [selected, setSelected] = useState('')
  const [pastJournal, setPastJournal] = useState<{ date: string; entries: JournalEntry[]; error?: string }>()
  const [active, setActive] = useState<string | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [reflectionComplete, setReflectionComplete] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [needsConsent, setNeedsConsent] = useState(false)
  const initialRoutineHandled = useRef(false)
  const today = overview?.today
  const selectedDate = selected || today?.localDate
  const isToday = selectedDate === today?.localDate
  const future = Boolean(today && selectedDate && selectedDate > today.localDate)

  useEffect(() => {
    if (!today || active || busy) return
    function refreshDate() {
      if (todayInSeoul() === today?.localDate) return
      setOverview(undefined)
      setSelected('')
      setRetry((value) => value + 1)
    }
    const timer = window.setInterval(refreshDate, 30_000)
    window.addEventListener('focus', refreshDate)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', refreshDate)
    }
  }, [active, busy, today])

  useEffect(() => {
    if (needsConsent) return
    const controller = new AbortController()
    const { signal } = controller
    void getTodayState(signal).then(
      (state) => { if (!signal.aborted) setTodayState(state) },
      () => { if (!signal.aborted) setTodayState(undefined) },
    )
    void (async () => {
      try {
        const today = await getRoutinesToday(signal)
        const journals = await getJournal(today.localDate, signal)
        if (signal.aborted) return
        const data = { today, journals }
        if (initialRoutine && !initialRoutineHandled.current) {
          if (today.localDate !== todayInSeoul()) {
            setError('날짜가 바뀌었어요. 오늘의 루틴을 다시 불러와 주세요.')
            return
          }
          const routine = findRecommendedRoutine(today.routines, initialRoutine)
          if (routine) {
            await recordRoutineStart(routine)
            if (signal.aborted) return
            setActive(routine.routineId)
          } else {
            setError('추천받은 루틴이 오늘의 루틴 목록에 없어요.')
          }
          initialRoutineHandled.current = true
        }
        setOverview(data)
        setHistory(saveRoutineHistory(loginId, data))
      } catch (error) {
        if (signal.aborted) return
        if (error instanceof ApiError && error.code === 'CONSENT_REQUIRED') setNeedsConsent(true)
        else setError(errorMessage(error, initialRoutine && !initialRoutineHandled.current
          ? '추천 루틴을 열지 못했어요.'
          : '루틴 정보를 불러오지 못했어요.'))
      }
    })()
    return () => controller.abort()
  }, [initialRoutine, loginId, needsConsent, retry])

  useEffect(() => {
    if (!selected || isToday || future || needsConsent) return
    const controller = new AbortController()
    void getJournal(selected, controller.signal).then(
      (entries) => { if (!controller.signal.aborted) setPastJournal({ date: selected, entries }) },
      (error: unknown) => {
        if (!controller.signal.aborted) setPastJournal({ date: selected, entries: [], error: errorMessage(error, '마음 기록을 불러오지 못했어요.') })
      },
    )
    return () => controller.abort()
  }, [future, isToday, needsConsent, selected])

  async function saveConsent() {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      await saveRequiredConsents()
      setNeedsConsent(false)
    } catch (error) {
      setError(errorMessage(error, '필수 동의를 저장하지 못했어요.'))
    } finally {
      setBusy(false)
    }
  }

  function applyOverview(data: RoutineOverview) {
    setOverview(data)
    setHistory(saveRoutineHistory(loginId, data))
  }

  async function moveExercise(current: RoutineItem | undefined, next: RoutineItem | undefined, finished = false) {
    if (!overview || busy) return
    setBusy(true)
    setError('')
    let data = overview
    try {
      if (todayInSeoul() !== data.today.localDate) {
        setOverview(undefined)
        setActive(null)
        setSelected('')
        setRetry((value) => value + 1)
        return
      }
      if (current && current.status !== 'COMPLETED') {
        const result = await changeRoutine(current.routineId, finished ? 'complete' : 'skip')
        const routines = data.today.routines.map((item) => item.routineId === current.routineId ? { ...item, status: result.status } : item)
        data = { ...data, today: { ...data.today, routines } }
        applyOverview(data)
        if (result.status === 'COMPLETED' && !data.today.journalUnlocked && completedCount(routines, 0) === activityCount - reflections.length) {
          setRetry((value) => value + 1)
        }
      }
      if (next) await recordRoutineStart(next)
      setActive(next?.routineId ?? null)
    } catch (error) {
      setError(errorMessage(error, '루틴 기록을 저장하지 못했어요. 다시 시도해 주세요.'))
      if (error instanceof ApiError && error.status === 409) setRetry((value) => value + 1)
    } finally {
      setBusy(false)
    }
  }

  async function saveReflection(emotion: JournalEmotion | null, text: string) {
    if (!overview || busy) return
    setBusy(true)
    setError('')
    try {
      if (todayInSeoul() !== overview.today.localDate) {
        setError('날짜가 바뀌었어요. 루틴 목록으로 돌아가 오늘 기록을 열어 주세요.')
        return
      }
      const trimmed = text.trim()
      if (emotion || trimmed) {
        const entry = await writeJournal(emotion, trimmed)
        const journals = [...overview.journals, entry]
        applyOverview({ ...overview, journals })
        const routineItems = overview.today.routines
        if (completedCount(routineItems, countReflection(overview.journals)) < activityCount
          && completedCount(routineItems, countReflection(journals)) >= activityCount) {
          setReflectionComplete(true)
          return
        }
      }
      setActive(null)
    } catch (error) {
      setError(errorMessage(error, '마음 기록을 저장하지 못했어요.'))
    } finally {
      setBusy(false)
    }
  }

  if (needsConsent) return <ConsentPage onContinue={saveConsent} isSubmitting={busy} error={error} />

  if (!overview || !today) {
    return (
      <main className="routine-page routine-page--overview">
        <p role="status">{error || '루틴을 불러오는 중이에요.'}</p>
        {error && <button type="button" onClick={() => { setError(''); setRetry((value) => value + 1) }}>다시 불러오기</button>}
      </main>
    )
  }

  const exerciseIndex = today.routines.findIndex(({ routineId }) => routineId === active)
  const exercise = today.routines[exerciseIndex]
  if (active && exercise) {
    return (
      <RoutineExercise
        key={exercise.routineId}
        exercise={{
          routineId: exercise.routineId,
          title: exercise.title,
          background: visuals[exercise.routineId]?.background ?? background1,
          seconds: exercise.durationSec,
          guide: exercise.routineId === 'SEATED_TWIST'
            ? '의자에 앉아 발을 바닥에 두고,\n상체를 한쪽으로 천천히 돌립니다.\n반대쪽도 같은 방법으로 합니다.'
            : exercise.instruction,
          repeat: exercise.routineId === 'SEATED_TWIST' ? '2회 반복하세요!' : '',
        }}
        index={exerciseIndex}
        count={today.routines.length}
        soundEnabled={soundEnabled}
        onSoundChange={setSoundEnabled}
        busy={busy}
        error={error}
        onBack={(finished) => void moveExercise(exercise, undefined, finished)}
        onPrevious={exerciseIndex > 0 ? (finished) => void moveExercise(exercise, today.routines[exerciseIndex - 1], finished) : undefined}
        onNext={() => void moveExercise(exercise, today.routines[exerciseIndex + 1], true)}
      />
    )
  }

  const lastEmotion = overview.journals.findLast(({ emotion }) => emotion)?.emotion ?? null
  const lastText = overview.journals.findLast(({ text }) => text?.trim())?.text ?? ''

  if (active && reflectionComplete) {
    return (
      <main className="routine-reflection-complete">
        <CheckInComplete
          title="오늘도 한 겹 덜어냈어요!"
          onPrevious={() => setReflectionComplete(false)}
          onHome={onHome}
        />
      </main>
    )
  }

  if (active) {
    return (
      <RoutineReflection
        mood={lastEmotion}
        journal={lastText}
        busy={busy}
        error={error}
        onBack={() => { setError(''); setActive(null) }}
        onComplete={saveReflection}
      />
    )
  }

  const historyDay = selectedDate ? history[selectedDate] : undefined
  const selectedWeekDay = today.week.find(({ localDate }) => localDate === selectedDate)
  const selectedJournal = pastJournal?.date === selectedDate ? pastJournal : undefined
  const shownRoutines = isToday ? today.routines : historyDay?.routines ?? []
  const level = isToday ? today.level : historyDay?.level
  const statusText = todayState?.localDate === selectedDate ? todayState?.statusText : undefined
  const shownReflections = isToday ? countReflection(overview.journals) : historyDay?.reflectionCount ?? 0
  const allCompleted = completedCount(shownRoutines, shownReflections) >= activityCount

  function renderRoutine(item: RoutineItem) {
    const done = item.status === 'COMPLETED'
    return (
      <button className="routine-card" data-completed={done} disabled={busy || !isToday} key={item.routineId} type="button"
        onClick={() => void moveExercise(undefined, item)}>
        <span className="routine-thumbnail" style={{ backgroundImage: `url(${visuals[item.routineId]?.image ?? step1})` }} />
        <span className="routine-card-copy">
          <strong>{item.title}</strong>
          <span>{item.subtitle}</span>
          <span className="routine-duration"><img src={clock} alt="" width="15" height="15" />{item.durationSec === 60 ? '1분' : `${item.durationSec}초`}</span>
        </span>
        <span className="routine-checkbox" role="img" aria-label={done ? '완료' : '미완료'} />
      </button>
    )
  }

  return (
    <main className="routine-page routine-page--overview">
      <header className="routine-intro">
        <h1>오늘은 조금 덜어내 볼까요?</h1>
        <p>지금 나에게 필요한 작은 쉼을 선택하세요</p>
      </header>
      <ol className="routine-week" aria-label="이번 주 루틴 완료 현황">
        {today.week.map(({ localDate, done }, index) => {
          const snapshot = history[localDate]
          const count = localDate === today.localDate ? completedCount(today.routines, countReflection(overview.journals))
            : snapshot ? completedCount(snapshot.routines, snapshot.reflectionCount) : 0
          const weekday = weekdays[index]
          const day = Number(localDate.slice(-2))
          const status = !count && localDate !== today.localDate && done ? '완료 기록 있음, 개수 미확인' : `${activityCount}개 중 ${count}개 완료`
          return (
            <li key={localDate}>
              <button type="button" aria-current={localDate === today.localDate ? 'date' : undefined}
                aria-pressed={localDate === selectedDate} aria-label={`${day}일 ${weekday}요일, ${status}`}
                onClick={() => { setSelected(localDate); setError('') }}>
                <span className="routine-day" style={count > 0 ? {
                  backgroundColor: `hsl(10.5495deg 86.6667% 79.4118% / ${Math.min(count, activityCount) / activityCount})`,
                } : undefined}>{day}</span>
                <span className="routine-weekday">{weekday}</span>
              </button>
            </li>
          )
        })}
      </ol>
      {error && <p role="alert">{error}</p>}
      {future ? <p role="status">아직 오지 않은 날짜예요.</p> : (
        <>
          <section className="routine-status" aria-label={isToday ? '오늘의 상태' : '선택한 날짜의 상태'}>
            <div className="routine-sheep"><img src={allCompleted ? completedSheep : sheep} alt="" width="44" height="51" /></div>
            <div className="routine-status-copy">
              <div className="routine-status-label"><span>{isToday ? '오늘의 상태' : selectedDate}</span>{level != null && <span>{level}단계</span>}</div>
              {allCompleted ? <strong>한 겹 덜어냈어요</strong> : isToday ? (
                (statusText || level == null) && <strong>{statusText || '기록 없음'}</strong>
              ) : <strong>이날의 루틴 기록</strong>}
              {isToday && !allCompleted && <p>가벼운 회복 루틴을 추천해요</p>}
              {!isToday && !historyDay && <p>{selectedWeekDay?.done ? '완료 기록이 있어요. 항목별 완료 상태는 확인할 수 없어요.' : '완료한 루틴 기록이 없어요.'}</p>}
            </div>
          </section>
          {shownRoutines.length > 0 && (
            <section className="routine-section" aria-labelledby="routine-recommended">
              <div className="routine-section-heading">
                <h2 id="routine-recommended">{isToday ? '오늘의 추천 루틴' : '이날의 추천 루틴'}</h2>
                <span>{shownRoutines.length}가지</span>
              </div>
              <div className="routine-cards">{shownRoutines.map(renderRoutine)}</div>
            </section>
          )}
          <section className="routine-section routine-reflections" aria-labelledby="routine-reflections">
            <div className="routine-section-heading">
              <div>
                <h2 id="routine-reflections">마음 정리하기</h2>
                {isToday && !today.journalUnlocked && <p>오늘의 추천 루틴을 모두 완료하면 잠금이 풀려요</p>}
              </div>
              {isToday && <span>{reflections.length}가지</span>}
            </div>
            {isToday ? <div className="routine-cards">
              {reflections.map(({ id, title, image }) => {
                const done = id === 'mood' ? Boolean(lastEmotion) : Boolean(lastText)
                return (
                  <button className="routine-card" data-completed={done} disabled={busy || !today.journalUnlocked} key={id}
                    type="button" onClick={() => setActive(id)}>
                    <span className="routine-reflection-icon"><img src={image} alt="" /></span>
                    <span className="routine-card-copy"><strong>{title}</strong></span>
                    {today.journalUnlocked
                      ? <span className="routine-checkbox" role="img" aria-label={done ? '완료' : '미완료'} />
                      : <span className="routine-lock" role="img" aria-label="잠김" />}
                  </button>
                )
              })}
            </div> : !selectedJournal ? <p role="status">마음 기록을 불러오는 중이에요.</p>
              : selectedJournal.error ? <p role="alert">{selectedJournal.error}</p>
              : selectedJournal.entries.length === 0 ? <p>이날 작성한 마음 기록이 없어요.</p>
              : <ul className="routine-journal-history">
                {selectedJournal.entries.map(({ emotion, text }, index) => (
                  <li key={index}>
                    {emotion && <strong>{journalMoods[emotion]}</strong>}
                    {text && <p>{text}</p>}
                  </li>
                ))}
              </ul>}
          </section>
        </>
      )}
    </main>
  )
}
