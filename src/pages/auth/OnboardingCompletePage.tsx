import completedSheep from '../../assets/image/checkin_sheeep.png'
import '../../styles/auth/OnboardingCompletePage.css'

type OnboardingCompletePageProps = {
  onBack: () => void
  onHome: () => void
}

export default function OnboardingCompletePage({ onBack, onHome }: OnboardingCompletePageProps) {
  return (
    <main className="welcome onboarding-complete" aria-labelledby="onboarding-complete-title">
      <button className="introduction__back" type="button" onClick={onBack}>
        <span aria-hidden="true">‹</span> 이전
      </button>
      <div className="onboarding-complete__content">
        <div className="welcome__portrait">
          <img src={completedSheep} width="213" height="213" alt="" />
        </div>
        <h1 id="onboarding-complete-title">이제 너에 대해<br />조금 알 것 같아요!</h1>
        <p>앞으로 천천히 친해져요.</p>
        <p className="onboarding-complete__note">답변은 마이페이지에서 언제든 바꿀 수 있어요.</p>
      </div>
      <button className="onboarding-continue" type="button" onClick={onHome}>홈으로</button>
    </main>
  )
}
