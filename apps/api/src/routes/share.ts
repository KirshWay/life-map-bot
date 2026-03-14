import { Hono } from 'hono'
import { randomUUID } from 'node:crypto'
import type { TelegramUser } from '../middleware/telegram.js'

type StoredImage = {
  data: Uint8Array
  createdAt: number
}

const imageStore = new Map<string, StoredImage>()
const userLastUpload = new Map<number, number>()

export const resetStores = (): void => {
  imageStore.clear()
  userLastUpload.clear()
}

const TTL_MS = 5 * 60 * 1000
const MAX_SIZE = 1024 * 1024
const MAX_ENTRIES = 100
const RATE_LIMIT_MS = 10_000

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

const isPng = (data: Uint8Array): boolean => {
  if (data.length < 8) return false
  return PNG_MAGIC.every((byte, i) => data[i] === byte)
}

setInterval(() => {
  const now = Date.now()
  for (const [id, entry] of imageStore) {
    if (now - entry.createdAt > TTL_MS) {
      imageStore.delete(id)
    }
  }
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

  if (imageStore.size >= MAX_ENTRIES) {
    return c.json(
      { error: { code: 'SERVICE_BUSY', message: 'Too many requests, try again later' } },
      503
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

  const id = randomUUID()
  imageStore.set(id, { data, createdAt: Date.now() })
  userLastUpload.set(user.id, Date.now())

  return c.json({ data: { id } })
})

shareRoutes.get('/:filename', (c) => {
  const filename = c.req.param('filename')
  const id = filename?.replace(/\.png$/, '')
  if (!id) {
    return c.text('Not found', 404)
  }

  const entry = imageStore.get(id)
  if (!entry) {
    return c.text('Not found', 404)
  }

  c.header('Content-Type', 'image/png')
  c.header('Cache-Control', 'no-store')
  c.header('Access-Control-Allow-Origin', '*')
  return c.body(
    entry.data.buffer.slice(
      entry.data.byteOffset,
      entry.data.byteOffset + entry.data.byteLength
    ) as ArrayBuffer
  )
})
