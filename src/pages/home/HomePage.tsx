import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import originalSheep from '../../assets/image/original_sheep.png'
import levelOneSheep from '../../assets/image/sheep_1.png'
import levelTwoSheep from '../../assets/image/sheep_2.png'
import levelThreeSheep from '../../assets/image/sheep_3.png'
import levelFourSheep from '../../assets/image/sheep_4.png'
import miniSheep from '../../assets/image/sheep_mini.png'
import speechBubble from '../../assets/image/speech_bubble.png'
import { CheckIn, CheckInComplete } from './CheckIn'
import { buildCheckInRequest, checkInSteps, restoreCheckInAnswers } from './checkInQuestions'
import { activityRanges, readCheckInActivity, saveCheckInActivity } from './checkInActivity'
import { getManualSignals } from '../../api/manualSignals'
import { todayInSeoul } from '../../serviceDate'
import { getCheckIn, submitCheckIn } from '../../api/checkIns'
import { ApiError } from '../../api/client'
import { saveRequiredConsents } from '../../api/consents'
import { getTodayState, getWeeklyInsights, type TodayState, type WeeklyInsights } from '../../api/home'
import ConsentPage from '../auth/ConsentPage'
import WeeklyChanges from './WeeklyChanges'
import '../../styles/home/HomePage.css'

const panels = ['하루 체크인', '홈', '이번 주 변화']
const sheepImages: Partial<Record<string, string>> = {
  sheep_level_1: levelOneSheep,
  sheep_level_2: levelTwoSheep,
  sheep_level_3: levelThreeSheep,
  sheep_level_4: levelFourSheep,
}

type HomeResult<T> = { data: T } | { error: unknown } | null

function HomePage({ loginId, onOpenRoutine }: { loginId: string; onOpenRoutine: () => void }) {
  const slidesRef = useRef<HTMLDivElement>(null)
  const backgroundRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(1)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [walkingAnswer, setWalkingAnswer] = useState('')
  const [loadedCheckInDate, setLoadedCheckInDate] = useState('')
  const [checkInLoadError, setCheckInLoadError] = useState('')
  const [checkInRetry, setCheckInRetry] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [needsConsent, setNeedsConsent] = useState(false)
  const [skipped, setSkipped] = useState(false)
  const [today, setToday] = useState<HomeResult<TodayState>>(null)
  const [week, setWeek] = useState<HomeResult<WeeklyInsights>>(null)
  const [refreshCount, setRefreshCount] = useState(0)
  const pendingRequest = useRef<{ body: string; key: string } | null>(null)
  const complete = step === checkInSteps.length
  const checkInDate = todayInSeoul()
  const shouldLoadCheckIn = current === 0 && !needsConsent && loadedCheckInDate !== checkInDate
  const todayData = today && 'data' in today ? today.data : null
  const weekData = week && 'data' in week ? week.data : null
  const sheepLevel = todayData?.level ?? null
  const sheepImage = sheepImages[todayData?.assetKey ?? ''] ?? originalSheep

  useLayoutEffect(() => {
    const slides = slidesRef.current
    if (slides) slides.scrollLeft = slides.clientWidth
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    void getTodayState(signal).then(
      (data) => { if (!signal.aborted) setToday({ data }) },
      (error: unknown) => { if (!signal.aborted) setToday({ error }) },
    )
    void getWeeklyInsights(signal).then(
      (data) => { if (!signal.aborted) setWeek({ data }) },
      (error: unknown) => { if (!signal.aborted) setWeek({ error }) },
    )
    return () => controller.abort()
  }, [refreshCount])

  useEffect(() => {
    if (!shouldLoadCheckIn) return
    const controller = new AbortController()
    void Promise.all([
      getCheckIn(checkInDate, controller.signal),
      getManualSignals(checkInDate, controller.signal).catch(() => null),
    ]).then(([record, signals]) => {
      if (controller.signal.aborted) return
      const restored = restoreCheckInAnswers(record)
      const activity = readCheckInActivity(loginId, checkInDate)
      const serverRanges = activityRanges(signals)
      restored[checkInSteps.length - 1] = activity.sleep || serverRanges.sleep
      pendingRequest.current = null
      setStep(0)
      setAnswers(restored)
      setWalkingAnswer(activity.walking || serverRanges.walking)
      setLoadedCheckInDate(checkInDate)
      setCheckInLoadError('')
    }, (error: unknown) => {
      if (controller.signal.aborted) return
      if (error instanceof ApiError && error.code === 'CONSENT_REQUIRED') {
        setNeedsConsent(true)
      } else {
        setCheckInLoadError(error instanceof ApiError ? error.message : '오늘 체크인을 불러오지 못했어요.')
      }
    })
    return () => controller.abort()
  }, [checkInDate, checkInRetry, loginId, shouldLoadCheckIn])

  function refreshHome() {
    setToday(null)
    setWeek(null)
    setRefreshCount((count) => count + 1)
  }

  function goToPanel(index: number, immediate = false) {
    const slides = slidesRef.current
    if (!slides) return

    slides.scrollTo({
      left: index * slides.clientWidth,
      behavior: immediate || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    })
  }

  function selectAnswer(answer: string) {
    setAnswers((previous) => {
      const updated = [...previous]
      updated[step] = answer
      return updated
    })
  }

  async function advanceCheckIn(skip = false) {
    if (isSubmitting) return
    setSubmitError('')

    if (step < checkInSteps.length - 1) {
      if (skip) selectAnswer('')
      setStep(step + 1)
      return
    }

    setIsSubmitting(true)
    try {
      const input = buildCheckInRequest(answers)
      const body = JSON.stringify(input)
      if (pendingRequest.current?.body !== body) {
        pendingRequest.current = { body, key: crypto.randomUUID() }
      }
      const { status, localDate } = await submitCheckIn(input, pendingRequest.current.key)
      pendingRequest.current = null
      saveCheckInActivity(loginId, localDate, skip ? '' : answers[step], skip ? '' : walkingAnswer)
      setLoadedCheckInDate(localDate)
      if (skip) {
        selectAnswer('')
        setWalkingAnswer('')
      }
      setSkipped(status === 'SKIPPED')
      setStep(checkInSteps.length)
      refreshHome()
    } catch (error) {
      if (error instanceof ApiError && error.code === 'CONSENT_REQUIRED') {
        setNeedsConsent(true)
      } else {
        setSubmitError(error instanceof Error && !(error instanceof TypeError)
          ? error.message
          : '서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  async function saveConsent() {
    if (isSubmitting) return
    setIsSubmitting(true)
    setSubmitError('')
    try {
      await saveRequiredConsents()
      setNeedsConsent(false)
      refreshHome()
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : '필수 동의를 저장할 수 없어요. 다시 시도해 주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function renderLoadStatus(result: HomeResult<unknown>, loadingMessage: string) {
    if (!result) return <p role="status">{loadingMessage}</p>
    if (!('error' in result)) return null

    const error = result.error
    const requiresConsent = error instanceof ApiError && error.code === 'CONSENT_REQUIRED'
    return (
      <>
        <p role="status">{error instanceof ApiError ? error.message : '정보를 불러오지 못했어요.'}</p>
        <button type="button" onClick={requiresConsent ? () => {
          setSubmitError('')
          setNeedsConsent(true)
          goToPanel(0)
        } : refreshHome}>
          {requiresConsent ? '필수 동의 확인하기' : '다시 불러오기'}
        </button>
      </>
    )
  }

  return (
    <main className="home" data-panel={current} data-complete={complete || undefined} aria-label="홈">
      <div className="home__background" aria-hidden="true">
        <div className="home__background-scene" ref={backgroundRef} />
      </div>
      <div
        className="home__slides"
        inert={complete}
        ref={slidesRef}
        onScroll={(event) => {
          const { scrollLeft, clientWidth } = event.currentTarget
          if (clientWidth) {
            const offset = Math.max(0, Math.min(2 * clientWidth, scrollLeft))
            backgroundRef.current?.style.setProperty('--home-scroll', `${offset}px`)
            const index = Math.round(scrollLeft / clientWidth)
            setCurrent(Math.max(0, Math.min(panels.length - 1, index)))
          }
        }}
      >
        <section className="home__panel home__panel--summary" aria-label={panels[0]} inert={current !== 0}>
          {needsConsent ? (
            <ConsentPage embedded onContinue={saveConsent} isSubmitting={isSubmitting} error={submitError} />
          ) : loadedCheckInDate !== checkInDate && !complete ? (
            <div className="check-in">
              <h1 className="check-in__title">하루 체크인</h1>
              <p role="status">{checkInLoadError || '오늘 체크인을 불러오는 중이에요.'}</p>
              {checkInLoadError && <button type="button" onClick={() => {
                setCheckInLoadError('')
                setCheckInRetry((count) => count + 1)
              }}>다시 불러오기</button>}
            </div>
          ) : !complete && (
            <CheckIn
              step={step}
              answer={answers[step]}
              walkingAnswer={walkingAnswer}
              onSelect={selectAnswer}
              onSelectWalking={setWalkingAnswer}
              onPrevious={() => {
                setSubmitError('')
                setStep(step - 1)
              }}
              onNext={() => void advanceCheckIn()}
              onSkip={() => void advanceCheckIn(true)}
              isSubmitting={isSubmitting}
              error={submitError}
            />
          )}
        </section>
        <section className="home__panel" aria-label={panels[1]}>
          <div className="sheep-progress" role="img" aria-label={sheepLevel === null ? '오늘의 양 레벨 기록 없음' : `오늘의 양 레벨 ${sheepLevel}단계`}>
            <img className="sheep-progress__mini" src={miniSheep} alt="" />
            <img src={miniSheep} width="66" height="49" alt="" />
            {sheepLevel !== null && <span className="sheep-progress__number">{sheepLevel}</span>}
            <img className="sheep-progress__mini" src={miniSheep} alt="" />
            <img className="sheep-progress__mini" src={miniSheep} alt="" />
          </div>
          {!todayData && (
            <div className="home__level-status">
              {renderLoadStatus(today, '오늘의 양 레벨을 불러오는 중이에요.')}
            </div>
          )}
          {todayData?.isStale && <p className="home__level-status" role="status">이전 기록 기준</p>}

          <div className="home__bubble">
            <img src={speechBubble} width="206" height="53" alt="" />
            <p>오늘 있었던 일, 나한테 들려줄래?</p>
          </div>
          <img
            className="home__sheep"
            src={sheepImage}
            alt="양"
          />
        </section>
        <section className="home__panel home__panel--summary" aria-label={panels[2]} inert={current !== 2}>
          <WeeklyChanges
            data={weekData}
            sheepImage={sheepImage}
            loadStatus={renderLoadStatus(week, '이번 주 변화를 불러오는 중이에요.')}
            onOpenRoutine={onOpenRoutine}
          />
        </section>
      </div>

      <div className="home__controls" inert={complete}>
        <button className="home-shortcut" type="button" disabled={current === 0} onClick={() => goToPanel(current - 1)}>
          {panels[Math.max(0, current - 1)]}
          <span className="home-shortcut__circle" aria-hidden="true">
            <svg width="34" height="34" viewBox="0 0 34 34">
              <path d="m21 9-8 8 8 8" />
            </svg>
          </span>
        </button>

        <div className="home__dots" role="status">
          <span className="home__panel-status">{panels[current]}</span>
          {panels.map((panel, index) => (
            <span
              key={panel}
              className="home__dot"
              data-current={index === current ? '' : undefined}
              aria-hidden="true"
            />
          ))}
        </div>

        <button className="home-shortcut" type="button" disabled={current === 2} onClick={() => goToPanel(current + 1)}>
          {panels[Math.min(2, current + 1)]}
          <span className="home-shortcut__circle" aria-hidden="true">
            <svg width="34" height="34" viewBox="0 0 34 34">
              <path d="m13 9 8 8-8 8" />
            </svg>
          </span>
        </button>
      </div>
      {complete && (
        <CheckInComplete
          skipped={skipped}
          onPrevious={() => setStep(checkInSteps.length - 1)}
          onHome={() => {
            goToPanel(1, true)
            setCurrent(1)
            setStep(0)
          }}
        />
      )}
    </main>
  )
}

export default HomePage
