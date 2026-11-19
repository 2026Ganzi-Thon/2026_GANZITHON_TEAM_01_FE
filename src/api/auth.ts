import { API_BASE_URL } from './baseUrl'

const authUrl = `${import.meta.env.DEV ? '' : API_BASE_URL}/api/v1/auth`

type LoginRequest = {
  loginId: string
  password: string
}

type SignupRequest = LoginRequest & {
  passwordConfirm: string
}

export function signup(input: SignupRequest): Promise<void> {
  return postAuth('signup', '회원가입', input)
}

export function login(input: LoginRequest): Promise<void> {
  return postAuth('login', '로그인', input)
}

async function postAuth(path: 'signup' | 'login', action: string, input: LoginRequest): Promise<void> {
  const csrfResponse = await fetch(`${authUrl}/csrf`, {
    credentials: 'include',
    cache: 'no-store',
  })
  if (!csrfResponse.ok) {
    throw new Error(`${action} 보안 확인에 실패했어요. 다시 시도해 주세요.`)
  }

  const { headerName, token } = (await csrfResponse.json().catch(() => null)) ?? {}
  if (typeof headerName !== 'string' || !headerName || typeof token !== 'string' || !token) {
    throw new Error(`${action} 보안 확인에 실패했어요. 다시 시도해 주세요.`)
  }

  const response = await fetch(`${authUrl}/${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      [headerName]: token,
    },
    body: JSON.stringify(input),
  })

  const succeeded = path === 'signup' ? response.status === 201 : response.ok
  if (!succeeded) {
    const body = await response.json().catch(() => null)
    const message = body?.error?.message
    throw new Error(typeof message === 'string' && message ? message : `${action}에 실패했어요. 다시 시도해 주세요.`)
  }
}
