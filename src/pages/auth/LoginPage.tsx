import { useState, type SubmitEvent } from 'react'
import { login } from '../../api/auth'
import { ApiError } from '../../api/client'
import '../../styles/auth/LoginPage.css'

function LoginPage({ onLogin, onSignup }: { onLogin: (loginId: string) => Promise<void>; onSignup: () => void }) {
  const [notice, setNotice] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return
    setNotice('')
    setSubmitError('')

    const form = new FormData(event.currentTarget)
    const loginId = String(form.get('loginId') ?? '').trim()
    if (!loginId) {
      setSubmitError('아이디를 입력해 주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      await login({ loginId, password: String(form.get('password') ?? '') })
      await onLogin(loginId)
    } catch (error) {
      setSubmitError(error instanceof ApiError && error.code === 'INVALID_CREDENTIALS'
        ? '아이디 또는 비밀번호가 맞지 않아요'
        : error instanceof Error && !(error instanceof TypeError)
        ? error.message
        : '서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login" aria-labelledby="login-title">
      <button className="login__signup" type="button" disabled={isSubmitting} onClick={onSignup}>회원가입</button>
      <h1 id="login-title">LOGIN</h1>
      <form
        className="login__form"
        onSubmit={handleSubmit}
      >
        <div className="login__fields">
          <input name="loginId" aria-label="아이디" placeholder="아이디" autoComplete="username" autoCapitalize="none" spellCheck={false} required readOnly={isSubmitting} />
          <input name="password" aria-label="비밀번호" placeholder="비밀번호" type="password" autoComplete="current-password" required readOnly={isSubmitting} />
        </div>
        {submitError && <p className="login__notice" role="alert">{submitError}</p>}
        <button className="onboarding-continue login__submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? '로그인 중…' : '로그인'}
        </button>
      </form>
      <div className="login__recovery">
        <button type="button" onClick={() => setNotice('아이디 찾기 기능은 아직 연결되지 않았어요.')}>아이디 찾기</button>
        <button type="button" onClick={() => setNotice('비밀번호 찾기 기능은 아직 연결되지 않았어요.')}>비밀번호 찾기</button>
      </div>
      <p className="login__notice" role="status">{notice}</p>
    </main>
  )
}

export default LoginPage
