import { Bot, session } from 'grammy'
import type { Context, SessionFlavor } from 'grammy'

export interface SessionData {
  awaitingBirthDate: boolean
}

export type BotContext = Context & SessionFlavor<SessionData>

export const createBot = (token: string): Bot<BotContext> => {
  const bot = new Bot<BotContext>(token)

  bot.use(session({ initial: (): SessionData => ({ awaitingBirthDate: false }) }))

  bot.catch((err) => {
    console.error(`[BOT] Error while handling update ${err.ctx.update.update_id}:`, err.error)
  })

  return bot
}
