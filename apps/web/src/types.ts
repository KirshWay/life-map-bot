export const WeekStatus = {
  Lived: 'lived',
  Current: 'current',
  Future: 'future',
} as const

export type WeekStatus = (typeof WeekStatus)[keyof typeof WeekStatus]
