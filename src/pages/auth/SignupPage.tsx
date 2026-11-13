import { useState } from 'react'
import '../../styles/auth/SignupPage.css'

function SignupPage({ onComplete }: { onComplete: () => void }) {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [showMismatch, setShowMismatch] = useState(false)
  const passwordsMatch = password === confirmation
  const hasMismatch = showMismatch && !passwordsMatch

  return (
    <main className="signup" aria-labelledby="signup-title">
      <form
        className="signup__form"
        onSubmit={(event) => {
          event.preventDefault()
          if (!passwordsMatch) {
            setShowMismatch(true)
            event.currentTarget.querySelector<HTMLInputElement>('#signup-confirmation')?.focus()
            return
          }
          onComplete()
        }}
      >
        <div className="signup__content">
          <h1 id="signup-title">아이디와 비밀번호를<br />입력해 주세요.</h1>
          <div className="signup__fields">
            <div className="signup__field">
              <input
                aria-label="아이디 (4~13자리 이내)"
                placeholder="아이디 (4~13자리 이내)"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                minLength={4}
                maxLength={13}
                required
              />
            </div>
            <div className="signup__field">
              <input
                aria-label="비밀번호 (10~12자리 이내)"
                placeholder="비밀번호 (10~12자리 이내)"
                type="password"
                autoComplete="new-password"
                minLength={10}
                maxLength={12}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <div>
              <div className="signup__field">
                <input
                  id="signup-confirmation"
                  aria-label="비밀번호 확인"
                  aria-invalid={hasMismatch}
                  aria-describedby={hasMismatch ? 'signup-password-error' : undefined}
                  placeholder="비밀번호 확인"
                  type="password"
                  autoComplete="new-password"
                  maxLength={12}
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  required
                />
                {(!confirmation || passwordsMatch) && <span className="signup__check" aria-hidden="true" />}
              </div>
              {hasMismatch && (
                <p id="signup-password-error" className="signup__error" role="alert">
                  비밀번호가 일치하지 않아요.
                </p>
              )}
            </div>
          </div>
        </div>
        <button className="onboarding-continue" type="submit">완료</button>
      </form>
    </main>
  )
}

export default SignupPage
