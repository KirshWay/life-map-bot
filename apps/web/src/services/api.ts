const API_URL = import.meta.env.VITE_API_URL ?? ''

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

export interface UserData {
  id: number
  telegramId: string
  birthDate: string
  chatId: string
  notificationsEnabled: boolean
  createdAt: string
}

export const getMe = async (initDataRaw: string): Promise<ApiResponse<UserData>> => {
  const res = await fetch(`${API_URL}/api/me`, {
    headers: { 'x-telegram-init-data': initDataRaw },
  })

  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    return {
      error: {
        code: 'INVALID_RESPONSE',
        message: `API returned ${res.status} (${contentType || 'no content-type'})`,
      },
    }
  }

  return (await res.json()) as ApiResponse<UserData>
}
