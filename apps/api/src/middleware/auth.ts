import { createMiddleware } from 'hono/factory'

export const apiSecretMiddleware = createMiddleware(async (c, next) => {
  const apiSecret = process.env.API_SECRET
  if (!apiSecret) {
    console.error('[AUTH] API_SECRET environment variable is not set')
    return c.json({ error: { code: 'SERVER_ERROR', message: 'Server misconfigured' } }, 500)
  }

  const provided = c.req.header('x-api-secret')
  if (!provided || provided !== apiSecret) {
    return c.json(
      { error: { code: 'UNAUTHORIZED', message: 'Invalid or missing API secret' } },
      401
    )
  }

  await next()
})
