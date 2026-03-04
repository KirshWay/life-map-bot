import { Composer, InlineKeyboard } from 'grammy'
import type { BotContext } from '../bot.js'
import { getUser } from '../services/api.js'

const startCommand = new Composer<BotContext>()

startCommand.command('start', async (ctx) => {
  const telegramId = ctx.from?.id?.toString()
  if (!telegramId) return

  try {
    const response = await getUser(telegramId)

    if (response.data) {
      const webAppUrl = process.env.WEB_APP_URL
      if (!webAppUrl) {
        await ctx.reply('WEB_APP_URL is not configured.')
        return
      }
      const keyboard = new InlineKeyboard().webApp('Open Life Map', webAppUrl)
      await ctx.reply('Your life map is ready!', { reply_markup: keyboard })
      return
    }
  } catch {}

  ctx.session.awaitingBirthDate = true
  await ctx.reply('Welcome! Send your birth date in DD.MM.YYYY format:')
})

export { startCommand }
