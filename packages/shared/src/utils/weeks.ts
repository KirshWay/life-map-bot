import { differenceInWeeks, addWeeks, addDays, parseISO } from 'date-fns'

const TOTAL_WEEKS = 80 * 52

export const getTotalWeeks = (): number => TOTAL_WEEKS

export const getWeeksLived = (birthDate: string): number => {
  const birth = parseISO(birthDate)
  const weeks = differenceInWeeks(new Date(), birth)
  return Math.max(0, weeks)
}

export const getCurrentWeekNumber = (birthDate: string): number => {
  const weeks = getWeeksLived(birthDate)
  return Math.min(weeks + 1, TOTAL_WEEKS)
}

export const getWeekDateRange = (
  birthDate: string,
  weekNumber: number
): { start: Date; end: Date } => {
  const birth = parseISO(birthDate)
  const start = addWeeks(birth, weekNumber - 1)
  const end = addDays(start, 6)
  return { start, end }
}
