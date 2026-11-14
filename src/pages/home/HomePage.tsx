import { useLayoutEffect, useRef, useState } from 'react'
import originalSheep from '../../assets/image/original_sheep.png'
import levelOneSheep from '../../assets/image/sheep_1.png'
import miniSheep from '../../assets/image/sheep_mini.png'
import speechBubble from '../../assets/image/speech_bubble.png'
import { CheckIn, CheckInComplete, checkInSteps } from './CheckIn'
import WeeklyChanges from './WeeklyChanges'
import '../../styles/home/HomePage.css'

const panels = ['하루 체크인', '홈', '이번 주 변화']

function HomePage({ sheepLevel, onOpenRoutine }: { sheepLevel: 1 | 2; onOpenRoutine: () => void }) {
  const slidesRef = useRef<HTMLDivElement>(null)
  const backgroundRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(1)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const complete = step === checkInSteps.length

  useLayoutEffect(() => {
    const slides = slidesRef.current
    if (slides) slides.scrollLeft = slides.clientWidth
  }, [])

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
          {!complete && (
            <CheckIn
              step={step}
              answer={answers[step]}
              onSelect={selectAnswer}
              onPrevious={() => setStep(step - 1)}
              onNext={() => setStep(step + 1)}
              onSkip={() => {
                selectAnswer('')
                setStep(step + 1)
              }}
            />
          )}
        </section>
        <section className="home__panel" aria-label={panels[1]}>
          <div className="sheep-progress" role="img" aria-label={`${sheepLevel}단계`}>
            <img className="sheep-progress__mini" src={miniSheep} alt="" />
            <img src={miniSheep} width="66" height="49" alt="" />
            <span className="sheep-progress__number">{sheepLevel}</span>
            <img className="sheep-progress__mini" src={miniSheep} alt="" />
            <img className="sheep-progress__mini" src={miniSheep} alt="" />
          </div>

          <div className="home__bubble">
            <img src={speechBubble} width="206" height="53" alt="" />
            <p>오늘 있었던 일, 나한테 들려줄래?</p>
          </div>
          <img
            className="home__sheep"
            src={sheepLevel === 1 ? levelOneSheep : originalSheep}
            width={sheepLevel === 1 ? 253 : 338}
            height={sheepLevel === 1 ? 253 : 419}
            alt="양"
          />
        </section>
        <section className="home__panel home__panel--summary" aria-label={panels[2]} inert={current !== 2}>
          <WeeklyChanges onOpenRoutine={onOpenRoutine} />
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
          onPrevious={() => setStep(checkInSteps.length - 1)}
          onHome={() => {
            goToPanel(1, true)
            setCurrent(1)
            setStep(0)
            setAnswers([])
          }}
        />
      )}
    </main>
  )
}

export default HomePage
