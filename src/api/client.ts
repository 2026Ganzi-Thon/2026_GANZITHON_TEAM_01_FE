import { API_BASE_URL } from './baseUrl'

const apiUrl = `${import.meta.env.DEV ? '' : API_BASE_URL}/api/v1`

export class ApiError extends Error {
  readonly status: number
  readonly code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

async function throwApiError(response: Response, action: string): Promise<never> {
  const body = await response.json().catch(() => null)
  const { message, code } = body?.error ?? {}
  throw new ApiError(
    typeof message === 'string' && message ? message : `${action}에 실패했어요. 다시 시도해 주세요.`,
    response.status,
    typeof code === 'string' ? code : undefined,
  )
}

export async function readApi<T>(path: string, action: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, { credentials: 'include', cache: 'no-store', signal })
  if (!response.ok) await throwApiError(response, action)
  return response.json()
}

export async function writeApi(
  path: string,
  action: string,
  input: object,
  options: { method?: 'POST' | 'PATCH'; expectedStatus?: number; idempotencyKey?: string } = {},
) {
  const csrfResponse = await fetch(`${apiUrl}/auth/csrf`, {
    credentials: 'include',
    cache: 'no-store',
  })
  const { headerName, token } = csrfResponse.ok ? (await csrfResponse.json().catch(() => null)) ?? {} : {}
  if (typeof headerName !== 'string' || !headerName || typeof token !== 'string' || !token) {
    throw new ApiError(`${action} 보안 확인에 실패했어요. 다시 시도해 주세요.`, csrfResponse.status)
  }

  const headers = new Headers({ 'Content-Type': 'application/json', [headerName]: token })
  if (options.idempotencyKey) headers.set('Idempotency-Key', options.idempotencyKey)

  const response = await fetch(`${apiUrl}${path}`, {
    method: options.method ?? 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(input),
  })

  const succeeded = options.expectedStatus === undefined ? response.ok : response.status === options.expectedStatus
  if (!succeeded) await throwApiError(response, action)

  return response
}
