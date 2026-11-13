import { useEffect, useState, type CSSProperties } from 'react'
import sheep from '../../assets/image/original_sheep.png'
import '../../styles/routine/RoutineExercise.css'

type RoutineExerciseProps = {
  exercise: { title: string; background: string; seconds: number; guide: string; repeat: string }
  index: number
  count: number
  onBack: (finished: boolean) => void
  onPrevious?: (finished: boolean) => void
  onNext: () => void
}

export default function RoutineExercise({ exercise, index, count, onBack, onPrevious, onNext }: RoutineExerciseProps) {
  const duration = exercise.seconds * 1000
  const [timeLeft, setTimeLeft] = useState(duration)
  const secondsLeft = Math.ceil(timeLeft / 1000)
  const finished = timeLeft === 0

  useEffect(() => {
    const end = performance.now() + duration
    const interval = window.setInterval(() => {
      const remaining = Math.max(0, end - performance.now())
      setTimeLeft(remaining)
      if (!remaining) window.clearInterval(interval)
    }, 50)
    return () => window.clearInterval(interval)
  }, [duration])

  return (
    <main className="routine-exercise" aria-labelledby="routine-exercise-title">
      <div className="routine-exercise__background" style={{ backgroundImage: `url(${exercise.background})` }} />
      <button className="routine-exercise__back" type="button" aria-label="루틴 목록으로 돌아가기" onClick={() => onBack(finished)}>
        <span aria-hidden="true" />
      </button>
      <ol className="routine-exercise__steps" aria-label="추천 루틴 단계">
        {Array.from({ length: count }, (_, step) => (
          <li key={step} aria-label={`${step + 1}단계`} aria-current={step === index ? 'step' : undefined} />
        ))}
      </ol>
      <h1 id="routine-exercise-title" className={index >= 2 ? 'routine-exercise__title--light' : undefined}>{exercise.title}</h1>
      <div className="routine-exercise__timer" role="timer" aria-label={`남은 시간 ${secondsLeft}초`} style={{ '--elapsed-arc': `${(1 - timeLeft / duration) * 360}deg` } as CSSProperties}>{secondsLeft}S</div>
      <div className="routine-exercise__guidance">
        <img src={sheep} alt="" width="87" height="122" />
        <div className="routine-exercise__bubble">
          <p>{exercise.guide}</p>
          <p>{exercise.repeat}</p>
        </div>
      </div>
      <div className="routine-exercise__actions">
        {onPrevious && <button type="button" onClick={() => onPrevious(finished)}>이전</button>}
        <button type="button" disabled={!finished} onClick={onNext}>{index === count - 1 ? '종료' : '다음'}</button>
      </div>
    </main>
  )
}
