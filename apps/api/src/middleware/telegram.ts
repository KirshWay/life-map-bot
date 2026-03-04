import { createHmac } from 'node:crypto'
import { createMiddleware } from 'hono/factory'

export interface TelegramUser {
  id: number
  firstName: string
  lastName?: string
  username?: string
}

interface TelegramEnv {
  Variables: {
    telegramUser: TelegramUser
  }
}

export const validateInitData = (initDataRaw: string, botToken: string): boolean => {
  const params = new URLSearchParams(initDataRaw)
  const hash = params.get('hash')
  if (!hash) return false

  params.delete('hash')

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  const secret = createHmac('sha256', 'WebAppData').update(botToken).digest()
  const computed = createHmac('sha256', secret).update(dataCheckString).digest('hex')

  return computed === hash
}

const extractUser = (initDataRaw: string): TelegramUser | null => {
  const params = new URLSearchParams(initDataRaw)
  const userStr = params.get('user')
  if (!userStr) return null

  try {
    const raw: unknown = JSON.parse(userStr)
    if (typeof raw !== 'object' || raw === null) return null

    const obj = raw as Record<string, unknown>
    if (typeof obj.id !== 'number') return null

    return {
      id: obj.id,
      firstName: typeof obj.first_name === 'string' ? obj.first_name : '',
      lastName: typeof obj.last_name === 'string' ? obj.last_name : undefined,
      username: typeof obj.username === 'string' ? obj.username : undefined,
    }
  } catch {
    return null
  }
}

export const telegramAuthMiddleware = createMiddleware<TelegramEnv>(async (c, next) => {
  const botToken = process.env.BOT_TOKEN
  if (!botToken) {
    console.error('[TELEGRAM AUTH] BOT_TOKEN environment variable is not set')
    return c.json({ error: { code: 'SERVER_ERROR', message: 'Server misconfigured' } }, 500)
  }

  const initDataRaw = c.req.header('x-telegram-init-data')
  if (!initDataRaw) {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Missing Telegram init data' } }, 401)
  }

  if (!validateInitData(initDataRaw, botToken)) {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid Telegram init data' } }, 401)
  }

  const user = extractUser(initDataRaw)
  if (!user) {
    return c.json(
      { error: { code: 'UNAUTHORIZED', message: 'Could not extract user from init data' } },
      401
    )
  }

  c.set('telegramUser', user)
  await next()
})
