import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

interface HttpError extends Error {
  status?: number
}

const isHttpError = (err: Error): err is HttpError =>
  'status' in err && typeof (err as HttpError).status === 'number'

export const errorHandler = (err: Error, c: Context) => {
  console.error(`[ERROR] ${err.message}`, err.stack)

  const status = isHttpError(err) ? err.status : undefined
  const code = status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR'
  const statusCode = (status ?? 500) as ContentfulStatusCode

  return c.json(
    {
      error: {
        code,
        message: status ? err.message : 'Internal server error',
      },
    },
    statusCode
  )
}
