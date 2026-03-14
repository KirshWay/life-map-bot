import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Hono } from 'hono'
import { shareRoutes, resetStores } from '../routes/share.js'

vi.mock('grammy')

const PNG_HEADER = new Uint8Array([
  0x89,
  0x50,
  0x4e,
  0x47,
  0x0d,
  0x0a,
  0x1a,
  0x0a,
  ...new Array(100).fill(0),
])

const NOT_PNG = new Uint8Array([
  0x00,
  0x01,
  0x02,
  0x03,
  0x04,
  0x05,
  0x06,
  0x07,
  ...new Array(100).fill(0),
])

const createTestApp = (userId = 1) => {
  const app = new Hono()
  app.use('/upload', async (c, next) => {
    c.set('telegramUser' as never, { id: userId, firstName: 'Test' } as never)
    await next()
  })
  app.route('/', shareRoutes)
  return app
}

const uploadPng = (app: Hono, data: Uint8Array) => {
  const formData = new FormData()
  formData.append('image', new File([new Blob([data])], 'test.png', { type: 'image/png' }))
  return app.request('/upload', { method: 'POST', body: formData })
}

describe('share routes', () => {
  beforeEach(async () => {
    resetStores()
    vi.stubEnv('BOT_TOKEN', 'test-bot-token')

    const { Api, InputFile } = await import('grammy')
    vi.mocked(Api).mockImplementation(() => ({ sendPhoto: vi.fn().mockResolvedValue({}) }) as never)
    vi.mocked(InputFile).mockImplementation(((data: unknown, name: string) => ({
      data,
      name,
    })) as never)
  })

  describe('POST /upload', () => {
    it('should send PNG to chat and return success', async () => {
      const app = createTestApp()
      const res = await uploadPng(app, PNG_HEADER)

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.data.sent).toBe(true)
    })

    it('should reject non-PNG files with 400', async () => {
      const app = createTestApp()
      const res = await uploadPng(app, NOT_PNG)

      expect(res.status).toBe(400)
      const json = await res.json()
      expect(json.error).toMatchObject({
        code: 'BAD_REQUEST',
        message: 'Invalid image format',
      })
    })

    it('should reject requests without image field with 400', async () => {
      const app = createTestApp()
      const formData = new FormData()
      formData.append('wrong', 'data')

      const res = await app.request('/upload', { method: 'POST', body: formData })

      expect(res.status).toBe(400)
      const json = await res.json()
      expect(json.error.message).toBe('Missing image file')
    })

    it('should reject files larger than 1MB with 400', async () => {
      const app = createTestApp()
      const largeData = new Uint8Array(1024 * 1024 + 1)
      largeData.set(PNG_HEADER)

      const res = await uploadPng(app, largeData)

      expect(res.status).toBe(400)
      const json = await res.json()
      expect(json.error.message).toBe('Image too large (max 1MB)')
    })

    it('should return 429 when same user uploads twice within rate limit', async () => {
      const app = createTestApp(1)

      const res1 = await uploadPng(app, PNG_HEADER)
      expect(res1.status).toBe(200)

      const res2 = await uploadPng(app, PNG_HEADER)
      expect(res2.status).toBe(429)

      const json = await res2.json()
      expect(json.error.code).toBe('RATE_LIMITED')
    })

    it('should allow different users to upload simultaneously', async () => {
      const app1 = createTestApp(1)
      const app2 = createTestApp(2)

      const [res1, res2] = await Promise.all([
        uploadPng(app1, PNG_HEADER),
        uploadPng(app2, PNG_HEADER),
      ])

      expect(res1.status).toBe(200)
      expect(res2.status).toBe(200)
    })

    it('should return 502 when Bot API fails', async () => {
      const { Api } = await import('grammy')
      vi.mocked(Api).mockImplementationOnce(
        () =>
          ({
            sendPhoto: vi.fn().mockRejectedValue(new Error('bot blocked')),
          }) as never
      )

      const app = createTestApp()
      const res = await uploadPng(app, PNG_HEADER)

      expect(res.status).toBe(502)
      const json = await res.json()
      expect(json.error.code).toBe('SEND_FAILED')
    })
  })
})
