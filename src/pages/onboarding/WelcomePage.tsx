import originalSheep from '../../assets/image/original_sheep.png'
import '../../styles/onboarding/WelcomePage.css'

function WelcomePage({ onContinue }: { onContinue: () => void }) {
  return (
    <main className="welcome" aria-labelledby="welcome-title">
      <header className="welcome__brand">솜</header>
      <div className="welcome__intro">
        <div className="welcome__portrait">
          <img src={originalSheep} width="194" height="225" alt="" />
        </div>
        <h1 id="welcome-title">안녕! 나는 소미야</h1>
        <p>오늘부터 네 마음을 함께 돌봐줄 친구야.</p>
      </div>
      <button className="onboarding-continue" type="button" onClick={onContinue}>
        다음
      </button>
    </main>
  )
}

export default WelcomePage
