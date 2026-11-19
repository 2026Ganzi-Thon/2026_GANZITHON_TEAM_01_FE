import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import meditation from '../../assets/audio/holizna-meditation.mp3'
import volumeOff from '../../assets/icon/volume_off.png'
import volumeOn from '../../assets/icon/volume_on.png'
import sheep from '../../assets/image/original_sheep.png'
import '../../styles/routine/RoutineExercise.css'

type RoutineExerciseProps = {
  exercise: { title: string; background: string; seconds: number; guide: string; repeat: string }
  index: number
  count: number
  soundEnabled: boolean
  busy: boolean
  error: string
  onSoundChange: (enabled: boolean) => void
  onBack: (finished: boolean) => void
  onPrevious?: (finished: boolean) => void
  onNext: () => void
}

export default function RoutineExercise({ exercise, index, count, soundEnabled, busy, error, onSoundChange, onBack, onPrevious, onNext }: RoutineExerciseProps) {
  const duration = exercise.seconds * 1000
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(duration)
  const secondsLeft = Math.ceil(timeLeft / 1000)
  const finished = timeLeft === 0

  useLayoutEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    return () => audio.pause()
  }, [])

  useLayoutEffect(() => {
    const audio = audioRef.current
    if (soundEnabled && audio?.paused) void audio.play().catch(() => {})
  }, [soundEnabled])

  function toggleSound() {
    const audio = audioRef.current
    if (!audio) return
    const enabled = audio.paused
    onSoundChange(enabled)
    if (enabled) void audio.play().catch(() => {})
    else audio.pause()
  }

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
      <audio ref={audioRef} src={meditation} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
      <div className="routine-exercise__controls">
        <button className="routine-exercise__back" type="button" aria-label="루틴 목록으로 돌아가기" disabled={busy} onClick={() => onBack(finished)}>
          <span aria-hidden="true" />
        </button>
        <button type="button" aria-label={playing ? '음악 끄기' : '음악 켜기'} onClick={toggleSound}>
          <img src={playing ? volumeOn : volumeOff} alt="" width="24" height="24" />
        </button>
      </div>
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
          {exercise.repeat && <p>{exercise.repeat}</p>}
        </div>
      </div>
      <div className="routine-exercise__actions">
        {onPrevious && <button type="button" disabled={busy} onClick={() => onPrevious(finished)}> 이전</button>}
        <button type="button" disabled={!finished || busy} onClick={onNext}>{busy ? '저장 중…' : index === count - 1 ? '종료' : '다음'}</button>
      </div>
      {error && <p role="alert">{error}</p>}
    </main>
  )
}
