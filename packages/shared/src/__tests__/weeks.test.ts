import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { format } from 'date-fns'
import {
  getTotalWeeks,
  getWeeksLived,
  getCurrentWeekNumber,
  getWeekDateRange,
} from '../utils/weeks.js'

const toLocalDate = (d: Date): string => format(d, 'yyyy-MM-dd')

describe('getTotalWeeks', () => {
  it('returns 4160 (80 years * 52 weeks)', () => {
    expect(getTotalWeeks()).toBe(4160)
  })
})

describe('getWeeksLived', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns correct weeks for a date exactly one year ago', () => {
    expect(getWeeksLived('2025-06-15')).toBe(52)
  })

  it('returns 0 for a future date', () => {
    expect(getWeeksLived('2028-03-10')).toBe(0)
  })

  it('returns 0 for today', () => {
    expect(getWeeksLived('2026-06-15')).toBe(0)
  })

  it('handles a birth date decades ago', () => {
    const weeks = getWeeksLived('1985-04-20')
    expect(weeks).toBeGreaterThan(2140)
    expect(weeks).toBeLessThan(2160)
  })
})

describe('getCurrentWeekNumber', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns 1 for a birth date today', () => {
    expect(getCurrentWeekNumber('2026-06-15')).toBe(1)
  })

  it('returns weeksLived + 1 (1-based)', () => {
    expect(getCurrentWeekNumber('2025-06-15')).toBe(53)
  })

  it('caps at total weeks for very old dates', () => {
    expect(getCurrentWeekNumber('1920-01-01')).toBe(4160)
  })
})

describe('getWeekDateRange', () => {
  it('returns start and end dates for a week', () => {
    const range = getWeekDateRange('1995-07-12', 1)
    expect(range.start).toBeInstanceOf(Date)
    expect(range.end).toBeInstanceOf(Date)
    expect(range.start.getTime()).toBeLessThan(range.end.getTime())
  })

  it('week 1 starts on the birth date', () => {
    const range = getWeekDateRange('1995-07-12', 1)
    expect(toLocalDate(range.start)).toBe('1995-07-12')
  })

  it('week 1 ends 6 days after birth date', () => {
    const range = getWeekDateRange('1995-07-12', 1)
    expect(toLocalDate(range.end)).toBe('1995-07-18')
  })

  it('week 2 starts 7 days after week 1', () => {
    const week1 = getWeekDateRange('1995-07-12', 1)
    const week2 = getWeekDateRange('1995-07-12', 2)
    const diffMs = week2.start.getTime() - week1.start.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    expect(diffDays).toBe(7)
  })
})
