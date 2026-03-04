import { Composer, InlineKeyboard } from 'grammy'
import { parse, isValid, isBefore, format } from 'date-fns'
import type { BotContext } from '../bot.js'
import { createUser } from '../services/api.js'

const birthdateHandler = new Composer<BotContext>()

birthdateHandler.on('message:text', async (ctx) => {
  if (!ctx.session.awaitingBirthDate) return

  const text = ctx.message.text.trim()

  const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/
  if (!dateRegex.test(text)) {
    await ctx.reply('Invalid format. Please send your birth date in DD.MM.YYYY format:')
    return
  }

  const parsed = parse(text, 'dd.MM.yyyy', new Date())
  if (!isValid(parsed)) {
    await ctx.reply('Invalid date. Please send a valid birth date in DD.MM.YYYY format:')
    return
  }

  if (!isBefore(parsed, new Date())) {
    await ctx.reply('Birth date must be in the past. Please try again:')
    return
  }

  const isoDate = format(parsed, 'yyyy-MM-dd')
  const telegramId = ctx.from.id.toString()
  const chatId = ctx.chat.id.toString()

  try {
    const response = await createUser({ telegramId, birthDate: isoDate, chatId })

    if (response.error) {
      await ctx.reply(`Error: ${response.error.message}`)
      return
    }
  } catch {
    await ctx.reply('Could not reach the API. Please try again later.')
    return
  }

  ctx.session.awaitingBirthDate = false

  const webAppUrl = process.env.WEB_APP_URL
  if (!webAppUrl) {
    await ctx.reply('Birth date saved! WEB_APP_URL is not configured yet.')
    return
  }

  const keyboard = new InlineKeyboard().webApp('Open Life Map', webAppUrl)
  await ctx.reply('Your life map is ready!', { reply_markup: keyboard })
})

export { birthdateHandler }
