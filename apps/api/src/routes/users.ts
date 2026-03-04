import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { createUserSchema, updateSettingsSchema } from 'shared'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'

const userRoutes = new Hono()

userRoutes.get('/', async (c) => {
  const allUsers = db.select().from(users).all()
  return c.json({ data: allUsers })
})

userRoutes.post('/', async (c) => {
  const result = createUserSchema.safeParse(await c.req.json())
  if (!result.success) {
    return c.json({ error: { code: 'VALIDATION_ERROR', message: result.error.message } }, 400)
  }

  const { telegramId, birthDate, chatId } = result.data

  const existing = db.select().from(users).where(eq(users.telegramId, telegramId)).get()
  if (existing) {
    return c.json({ error: { code: 'CONFLICT', message: 'User already exists' } }, 409)
  }

  db.insert(users).values({ telegramId, birthDate, chatId }).run()

  const user = db.select().from(users).where(eq(users.telegramId, telegramId)).get()

  return c.json({ data: user }, 201)
})

userRoutes.get('/:telegramId', async (c) => {
  const telegramId = c.req.param('telegramId')

  const user = db.select().from(users).where(eq(users.telegramId, telegramId)).get()
  if (!user) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'User not found' } }, 404)
  }

  return c.json({ data: user })
})

userRoutes.patch('/:telegramId/settings', async (c) => {
  const telegramId = c.req.param('telegramId')

  const result = updateSettingsSchema.safeParse(await c.req.json())
  if (!result.success) {
    return c.json({ error: { code: 'VALIDATION_ERROR', message: result.error.message } }, 400)
  }

  const existing = db.select().from(users).where(eq(users.telegramId, telegramId)).get()
  if (!existing) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'User not found' } }, 404)
  }

  db.update(users)
    .set({ notificationsEnabled: result.data.notificationsEnabled })
    .where(eq(users.telegramId, telegramId))
    .run()

  const updated = db.select().from(users).where(eq(users.telegramId, telegramId)).get()

  return c.json({ data: updated })
})

export { userRoutes }
