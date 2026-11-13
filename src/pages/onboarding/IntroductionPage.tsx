import '../../styles/onboarding/IntroductionPage.css'

const features = [
  { title: '따뜻한 대화', description: '말하고 싶은 만큼만 이야기해도 돼요.' },
  { title: '감정 체크인', description: '지금 내 마음을 잠깐 살펴볼 수 있어요.' },
  { title: '작은 회복 활동', description: '오늘 할 수 있는 가벼운 쉼을 함께 찾아봐요.' },
]

function IntroductionPage({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  return (
    <main className="welcome introduction" aria-labelledby="introduction-title">
      <button className="introduction__back" type="button" onClick={onBack}>
        <span aria-hidden="true">‹</span> 이전
      </button>
      <section className="introduction__content">
        <h1 id="introduction-title">
          마음이 무거운 날엔,<br />
          소미와 잠깐 쉬어 가요.
        </h1>
        <ol className="introduction__features">
          {features.map(({ title, description }, index) => (
            <li key={title}>
              <span className="introduction__number" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h2>{title}</h2>
                <p>{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <button className="onboarding-continue" type="button" onClick={onContinue}>
        회원 가입 하러 가기
      </button>
    </main>
  )
}

export default IntroductionPage
