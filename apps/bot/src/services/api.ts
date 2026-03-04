import type { CreateUser } from 'shared'

const API_URL = process.env.API_URL ?? 'http://localhost:3000'
const API_SECRET = process.env.API_SECRET ?? ''

interface ApiError {
  code: string
  message: string
}

interface ApiSuccess<T> {
  data: T
  error?: never
}

interface ApiFailure {
  data?: never
  error: ApiError
}

type ApiResponse<T> = ApiSuccess<T> | ApiFailure

interface UserData {
  id: number
  telegramId: string
  birthDate: string
  chatId: string
  notificationsEnabled: boolean
  createdAt: string
}

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

const request = async <T>(
  method: string,
  path: string,
  body?: unknown
): Promise<ApiResponse<T>> => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    let res: Response
    try {
      res = await fetch(`${API_URL}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-api-secret': API_SECRET,
        },
        body: body ? JSON.stringify(body) : undefined,
      })
    } catch (e) {
      if (attempt < MAX_RETRIES) {
        console.warn(`[API] Fetch failed (attempt ${attempt}/${MAX_RETRIES}), retrying...`)
        await delay(RETRY_DELAY_MS)
        continue
      }
      return {
        error: {
          code: 'NETWORK_ERROR',
          message: e instanceof Error ? e.message : 'Network request failed',
        },
      }
    }

    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.includes('application/json')) {
      return {
        error: {
          code: 'INVALID_RESPONSE',
          message: `API returned ${res.status} (${contentType || 'no content-type'})`,
        },
      }
    }

    return (await res.json()) as ApiResponse<T>
  }

  return { error: { code: 'NETWORK_ERROR', message: 'All retry attempts failed' } }
}

export const getUser = async (telegramId: string): Promise<ApiResponse<UserData>> =>
  request<UserData>('GET', `/api/users/${telegramId}`)

export const createUser = async (data: CreateUser): Promise<ApiResponse<UserData>> =>
  request<UserData>('POST', '/api/users', data)

export const getAllUsers = async (): Promise<ApiResponse<UserData[]>> =>
  request<UserData[]>('GET', '/api/users')
