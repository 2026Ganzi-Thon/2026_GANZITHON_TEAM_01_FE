import { useState } from 'react'
import '../../styles/routine/RoutineReflection.css'

const moods = ['불안함', '답답함', '피곤함', '무기력함', '괜찮음']

type Props = {
  mood: string
  journal: string
  onBack: () => void
  onComplete: (mood: string, journal: string) => void
}

export default function RoutineReflection({ mood, journal, onBack, onComplete }: Props) {
  const [selectedMood, setSelectedMood] = useState(mood)
  const [entry, setEntry] = useState(journal)

  return (
    <main className="routine-page routine-reflection" aria-labelledby="routine-reflection-title">
      <header>
        <button className="routine-exercise__back" type="button" aria-label="루틴 목록으로 돌아가기" onClick={onBack}>
          <span aria-hidden="true" />
        </button>
        <h1 id="routine-reflection-title">마음 정리하기</h1>
      </header>
      <form onSubmit={(event) => {
        event.preventDefault()
        onComplete(selectedMood, entry)
      }}>
        <fieldset>
          <legend>지금 마음은 어디에 가까워요?</legend>
          <div className="routine-reflection__moods">
            {moods.map((option) => (
              <button key={option} type="button" aria-pressed={selectedMood === option} onClick={() => setSelectedMood((current) => current === option ? '' : option)}>
                {option}
              </button>
            ))}
          </div>
          <button className="routine-reflection__skip" type="button" onClick={() => onComplete('', entry)}>건너뛰기</button>
        </fieldset>
        <div className="routine-reflection__journal">
          <label htmlFor="routine-journal">오늘 나를 가장 지치게 한 일은 무엇인가요?</label>
          <p id="routine-journal-help">쓰고 나면 조금 가벼워질 거예요</p>
          <textarea id="routine-journal" aria-describedby="routine-journal-help" value={entry} onChange={(event) => setEntry(event.target.value)} placeholder="마음에 떠오르는 것을 자유롭게 적어보세요!" />
          <button className="routine-reflection__skip" type="button" onClick={() => onComplete(selectedMood, '')}>건너뛰기</button>
        </div>
        <div className="routine-exercise__actions routine-reflection__actions">
          <button type="submit">완료</button>
        </div>
      </form>
    </main>
  )
}
