import { readApi, writeApi } from './client'

type LoginRequest = {
  loginId: string
  password: string
}

type SignupRequest = LoginRequest & {
  passwordConfirm: string
}

export function signup(input: SignupRequest) {
  return writeApi('/auth/signup', '회원가입', input, { expectedStatus: 201 })
}

export function login(input: LoginRequest) {
  return writeApi('/auth/login', '로그인', input)
}

export function getCurrentUser(signal: AbortSignal) {
  return readApi<{ loginId: string }>('/me', '로그인 상태 확인', signal)
}
