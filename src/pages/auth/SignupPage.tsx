import { useState, type SubmitEvent } from 'react'
import { signup } from '../../api/auth'
import '../../styles/auth/SignupPage.css'

function SignupPage({ onComplete }: { onComplete: (loginId: string) => void }) {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [showMismatch, setShowMismatch] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const passwordsMatch = confirmation.length > 0 && password === confirmation
  const hasMismatch = showMismatch && !passwordsMatch

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return
    setSubmitError('')

    if (!passwordsMatch) {
      setShowMismatch(true)
      event.currentTarget.querySelector<HTMLInputElement>('#signup-confirmation')?.focus()
      return
    }

    const loginId = String(new FormData(event.currentTarget).get('loginId') ?? '').trim()
    if (loginId.length < 4) {
      setSubmitError('아이디를 4자리 이상 입력해 주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      await signup({ loginId, password, passwordConfirm: confirmation })
      onComplete(loginId)
    } catch (error) {
      setSubmitError(error instanceof Error && !(error instanceof TypeError)
        ? error.message
        : '서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="signup" aria-labelledby="signup-title">
      <form
        className="signup__form"
        onSubmit={handleSubmit}
      >
        <div className="signup__content">
          <h1 id="signup-title">아이디와 비밀번호를<br />입력해 주세요.</h1>
          <div className="signup__fields">
            <div className="signup__field">
              <input
                name="loginId"
                aria-label="아이디 (4~13자리 이내)"
                placeholder="아이디 (4~13자리 이내)"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                minLength={4}
                maxLength={13}
                readOnly={isSubmitting}
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
                readOnly={isSubmitting}
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
                  readOnly={isSubmitting}
                  required
                />
                {passwordsMatch && <span className="signup__check" aria-hidden="true" />}
              </div>
              {hasMismatch && (
                <p id="signup-password-error" className="signup__error" role="alert">
                  비밀번호가 일치하지 않아요.
                </p>
              )}
            </div>
          </div>
          {submitError && <p className="signup__error" role="alert">{submitError}</p>}
        </div>
        <button className="onboarding-continue" type="submit" disabled={isSubmitting}>
          {isSubmitting ? '가입 중…' : '완료'}
        </button>
      </form>
    </main>
  )
}

export default SignupPage
