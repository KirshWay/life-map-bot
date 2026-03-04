import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import type { TelegramUser } from '../middleware/telegram.js'

interface TelegramEnv {
  Variables: {
    telegramUser: TelegramUser
  }
}

const meRoutes = new Hono<TelegramEnv>()

meRoutes.get('/', async (c) => {
  const telegramUser = c.get('telegramUser')
  const telegramId = telegramUser.id.toString()

  const user = db.select().from(users).where(eq(users.telegramId, telegramId)).get()
  if (!user) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'User not found' } }, 404)
  }

  return c.json({ data: user })
})

export { meRoutes }
