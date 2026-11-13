import { profileSteps } from '../../situationOptions'

type MyPageProps = {
  nickname: string
  answers: string[][]
  onAnswerChange: (step: number, answer: string[]) => void
}

export default function MyPage({ nickname, answers, onAnswerChange }: MyPageProps) {
  return (
    <main className="page-placeholder">
      <h1>마이</h1>
      {nickname && <p>{nickname}</p>}
      {profileSteps.map(({ label, options, multiple }, index) => {
        const answer = answers[index]

        return multiple ? (
          <fieldset key={label}>
            <legend>{label}</legend>
            {options.map((option) => (
              <div key={option}>
                <label>
                  <input
                    type="checkbox"
                    checked={answer.includes(option)}
                    onChange={(event) => onAnswerChange(index, event.target.checked ? [...answer, option] : answer.filter((value) => value !== option))}
                  />
                  {option}
                </label>
              </div>
            ))}
          </fieldset>
        ) : (
          <p key={label}>
            <label>
              {label}{' '}
              <select value={answer[0] ?? ''} onChange={(event) => onAnswerChange(index, event.target.value ? [event.target.value] : [])}>
                <option value="">선택 안 함</option>
                {options.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
          </p>
        )
      })}
    </main>
  )
}
