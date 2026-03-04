import { z } from 'zod'

export const userSchema = z.object({
  telegramId: z.string(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be ISO date format YYYY-MM-DD'),
  chatId: z.string(),
  notificationsEnabled: z.boolean(),
})

export type User = z.infer<typeof userSchema>

export const createUserSchema = z.object({
  telegramId: z.string().min(1, 'Telegram ID is required'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be ISO date format YYYY-MM-DD'),
  chatId: z.string().min(1, 'Chat ID is required'),
})

export type CreateUser = z.infer<typeof createUserSchema>

export const updateSettingsSchema = z.object({
  notificationsEnabled: z.boolean(),
})

export type UpdateSettings = z.infer<typeof updateSettingsSchema>
