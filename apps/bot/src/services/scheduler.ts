import { schedule } from 'node-cron'
import type { Bot } from 'grammy'
import type { BotContext } from '../bot.js'
import { getAllUsers } from './api.js'
import { getWeeksLived, getCurrentWeekNumber, getTotalWeeks } from 'shared'

const DELAY_MS = 50

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

export const startScheduler = (bot: Bot<BotContext>): void => {
  const totalWeeks = getTotalWeeks()

  schedule(
    '0 9 * * 1',
    async () => {
      console.log('[SCHEDULER] Weekly notification job started')

      let sent = 0
      let failed = 0
      let skipped = 0

      try {
        const response = await getAllUsers()

        if (response.error) {
          console.error(`[SCHEDULER] Failed to fetch users: ${response.error.message}`)
          return
        }

        const users = response.data

        for (const user of users) {
          if (!user.notificationsEnabled) {
            skipped++
            continue
          }

          const weeksLived = getWeeksLived(user.birthDate)
          const currentWeek = getCurrentWeekNumber(user.birthDate)

          const message = `📅 Week ${currentWeek} of your life has started. You've lived ${weeksLived} out of ${totalWeeks} weeks.`

          try {
            await bot.api.sendMessage(user.chatId, message)
            sent++
          } catch (e) {
            failed++
            const errMsg = e instanceof Error ? e.message : String(e)
            console.error(`[SCHEDULER] Failed to send to ${user.telegramId}: ${errMsg}`)
          }

          await delay(DELAY_MS)
        }
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : String(e)
        console.error(`[SCHEDULER] Unexpected error: ${errMsg}`)
      }

      console.log(`[SCHEDULER] Done. Sent: ${sent}, Failed: ${failed}, Skipped: ${skipped}`)
    },
    { timezone: 'UTC' }
  )

  console.log('[SCHEDULER] Weekly notifications scheduled (Monday 9:00 UTC)')
}
