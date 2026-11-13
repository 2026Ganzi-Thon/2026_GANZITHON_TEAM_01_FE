import checkCircle from '../../assets/icon/check_circle.png'
import checkCircleDone from '../../assets/icon/check_circle_done.png'
import { profileSteps } from '../../situationOptions'
import '../../styles/auth/SituationPage.css'

type SituationPageProps = {
  step: number
  value: string[]
  onChange: (value: string[]) => void
  onBack: () => void
  onSkip: () => void
  onContinue: () => void
}

export default function SituationPage({ step, value, onChange, onBack, onSkip, onContinue }: SituationPageProps) {
  const { title, description, options, multiple } = profileSteps[step]

  return (
    <main className="welcome situation" aria-labelledby="situation-title">
      <header className="situation__header">
        <div className="situation__navigation">
          <button type="button" onClick={onBack}><span aria-hidden="true">‹</span> 이전</button>
          <span aria-label={`${profileSteps.length}단계 중 ${step + 1}단계`}>{step + 1} / {profileSteps.length}</span>
          <button type="button" onClick={onSkip}>건너뛰기</button>
        </div>
        <div className="situation__progress" aria-hidden="true">
          {profileSteps.map(({ label }, index) => <span key={label} data-current={index === step ? '' : undefined} />)}
        </div>
      </header>

      <section className="situation__content">
        <h1 id="situation-title">{title[0]}<br />{title[1]}</h1>
        <p id="situation-description">{description}</p>
        <div className="situation__options" role={multiple ? 'group' : 'radiogroup'} aria-labelledby="situation-title" aria-describedby="situation-description">
          {options.map((option) => {
            const checked = value.includes(option)

            return (
              <label className="situation__option" key={option}>
                <input
                  type={multiple ? 'checkbox' : 'radio'}
                  name="profile-answer"
                  value={option}
                  checked={checked}
                  onChange={() => {
                    if (!multiple) onChange([option])
                    else onChange(checked ? value.filter((answer) => answer !== option) : [...value, option])
                  }}
                />
                <img src={checked ? checkCircleDone : checkCircle} alt="" width="18" height="18" />
                {option}
              </label>
            )
          })}
        </div>
      </section>

      <footer className="situation__footer">
        <p>나중에 마이페이지에서 바꿀 수 있어요</p>
        <button className="onboarding-continue" type="button" disabled={value.length === 0} onClick={onContinue}>다음</button>
      </footer>
    </main>
  )
}
