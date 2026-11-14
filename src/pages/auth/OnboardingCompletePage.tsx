import completedSheep from '../../assets/image/checkin_sheeep.png'
import '../../styles/auth/OnboardingCompletePage.css'

type OnboardingCompletePageProps = {
  nickname: string
  onBack: () => void
  onHome: () => void
}

export default function OnboardingCompletePage({ nickname, onBack, onHome }: OnboardingCompletePageProps) {
  const lastSyllable = nickname.normalize('NFC').slice(-1).charCodeAt(0)
  const hasFinalConsonant = lastSyllable >= 0xac00 && lastSyllable <= 0xd7a3 && (lastSyllable - 0xac00) % 28 !== 0

  return (
    <main className="welcome onboarding-complete" aria-labelledby="onboarding-complete-title">
      <button className="introduction__back" type="button" onClick={onBack}>
        <span aria-hidden="true">‹</span> 이전
      </button>
      <div className="onboarding-complete__content">
        <div className="welcome__portrait">
          <img src={completedSheep} width="213" height="213" alt="" />
        </div>
        <h1 id="onboarding-complete-title">이제 {nickname}{hasFinalConsonant ? '이' : ''}에 대해<br />조금 알 것 같아요!</h1>
        <p>앞으로 천천히 친해져요.</p>
      </div>
      <button className="onboarding-continue" type="button" onClick={onHome}>홈으로</button>
    </main>
  )
}
