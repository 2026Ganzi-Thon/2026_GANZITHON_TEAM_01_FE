import '../../styles/auth/NicknamePage.css'

type NicknamePageProps = {
  nickname: string
  onChange: (nickname: string) => void
  onBack: () => void
  onContinue: () => void
}

function NicknamePage({ nickname, onChange, onBack, onContinue }: NicknamePageProps) {
  return (
    <main className="welcome nickname" aria-labelledby="nickname-title">
      <form
        className="nickname__form"
        onSubmit={(event) => {
          event.preventDefault()
          if (nickname.trim()) onContinue()
        }}
      >
        <button className="introduction__back" type="button" onClick={onBack}>
          <span aria-hidden="true">‹</span> 이전
        </button>
        <section className="nickname__content">
          <h1 id="nickname-title">어떤 이름으로 불러 드릴까요?</h1>
          <p id="nickname-description">실명 대신 편하게 불리고 싶은 이름을 알려주세요.</p>
          <input
            aria-label="닉네임"
            aria-describedby="nickname-description"
            autoComplete="nickname"
            placeholder="닉네임을 입력해주세요!"
            value={nickname}
            onChange={(event) => onChange(event.target.value)}
            required
          />
        </section>
        <button className="onboarding-continue" type="submit" disabled={!nickname.trim()}>다음</button>
      </form>
    </main>
  )
}

export default NicknamePage
