import { Hono } from 'hono'
import { Api, InputFile } from 'grammy'
import type { TelegramUser } from '../middleware/telegram.js'

const MAX_SIZE = 1024 * 1024
const RATE_LIMIT_MS = 10_000

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

const userLastUpload = new Map<number, number>()

export const resetStores = (): void => {
  userLastUpload.clear()
}

const isPng = (data: Uint8Array): boolean => {
  if (data.length < 8) return false
  return PNG_MAGIC.every((byte, i) => data[i] === byte)
}

setInterval(() => {
  const now = Date.now()
  for (const [userId, timestamp] of userLastUpload) {
    if (now - timestamp > RATE_LIMIT_MS) {
      userLastUpload.delete(userId)
    }
  }
}, 60_000)

type ShareEnv = {
  Variables: {
    telegramUser: TelegramUser
  }
}

export const shareRoutes = new Hono<ShareEnv>()

shareRoutes.post('/upload', async (c) => {
  const user = c.get('telegramUser')

  const lastUpload = userLastUpload.get(user.id)
  if (lastUpload && Date.now() - lastUpload < RATE_LIMIT_MS) {
    return c.json(
      { error: { code: 'RATE_LIMITED', message: 'Please wait before sharing again' } },
      429
    )
  }

  const body = await c.req.parseBody()
  const file = body['image']

  if (!(file instanceof File)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Missing image file' } }, 400)
  }

  if (file.size > MAX_SIZE) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Image too large (max 1MB)' } }, 400)
  }

  const data = new Uint8Array(await file.arrayBuffer())

  if (!isPng(data)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid image format' } }, 400)
  }

  const botToken = process.env.BOT_TOKEN
  if (!botToken) {
    return c.json({ error: { code: 'SERVER_ERROR', message: 'Server misconfigured' } }, 500)
  }

  try {
    const api = new Api(botToken)
    await api.sendPhoto(user.id, new InputFile(data, 'life-map.png'))
  } catch {
    return c.json(
      {
        error: {
          code: 'SEND_FAILED',
          message: 'Failed to send image. Try /start in the bot first.',
        },
      },
      502
    )
  }

  userLastUpload.set(user.id, Date.now())

  return c.json({ data: { sent: true } })
})
