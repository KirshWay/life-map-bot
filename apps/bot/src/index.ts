import { createBot } from './bot.js'
import { startCommand } from './commands/start.js'
import { birthdateHandler } from './handlers/birthdate.js'
import { startScheduler } from './services/scheduler.js'

const token = process.env.BOT_TOKEN
if (!token) {
  console.error('BOT_TOKEN is required')
  process.exit(1)
}

const bot = createBot(token)

bot.use(startCommand)
bot.use(birthdateHandler)

startScheduler(bot)

bot.start()
console.log('Bot is running...')
