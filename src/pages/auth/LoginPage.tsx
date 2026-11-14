import { useState } from 'react'
import '../../styles/auth/LoginPage.css'

function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [notice, setNotice] = useState('')

  return (
    <main className="login" aria-labelledby="login-title">
      <h1 id="login-title">LOGIN</h1>
      <form
        className="login__form"
        onSubmit={(event) => {
          event.preventDefault()
          onLogin()
        }}
      >
        <div className="login__fields">
          <input aria-label="아이디" placeholder="아이디" autoComplete="username" autoCapitalize="none" spellCheck={false} />
          <input aria-label="비밀번호" placeholder="비밀번호" type="password" autoComplete="current-password" />
        </div>
        <button className="onboarding-continue login__submit" type="submit">로그인</button>
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
