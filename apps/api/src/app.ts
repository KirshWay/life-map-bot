import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { errorHandler } from './middleware/error.js'
import { apiSecretMiddleware } from './middleware/auth.js'
import { telegramAuthMiddleware } from './middleware/telegram.js'
import { userRoutes } from './routes/users.js'
import { healthRoutes } from './routes/health.js'
import { meRoutes } from './routes/me.js'

const app = new Hono()

app.use('*', logger())

app.route('/api/health', healthRoutes)

app.use('/api/me', telegramAuthMiddleware)
app.route('/api/me', meRoutes)

app.use('/api/users', apiSecretMiddleware)
app.use('/api/users/*', apiSecretMiddleware)
app.route('/api/users', userRoutes)

app.onError(errorHandler)

export { app }
