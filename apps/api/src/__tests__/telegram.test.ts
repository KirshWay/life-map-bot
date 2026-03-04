import { describe, it, expect } from 'vitest'
import { createHmac } from 'node:crypto'
import { validateInitData } from '../middleware/telegram.js'

const TEST_BOT_TOKEN = '7891011:XYz-Qwe456rTyUiOp789AsD012fGhJkL'

const createSignedInitData = (params: Record<string, string>, botToken: string): string => {
  const dataCheckString = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  const secret = createHmac('sha256', 'WebAppData').update(botToken).digest()
  const hash = createHmac('sha256', secret).update(dataCheckString).digest('hex')

  const searchParams = new URLSearchParams({ ...params, hash })
  return searchParams.toString()
}

describe('validateInitData', () => {
  const validParams = {
    query_id: 'BBKjpqRNBBBBBPLfgRxMN2ab',
    user: JSON.stringify({
      id: 551203849,
      first_name: 'Alice',
      last_name: 'Johnson',
      username: 'alice_j',
    }),
    auth_date: '1780000000',
    signature: 'a1b2c3d4e5f6g7h8',
  }

  it('returns true for correctly signed data', () => {
    const initData = createSignedInitData(validParams, TEST_BOT_TOKEN)
    expect(validateInitData(initData, TEST_BOT_TOKEN)).toBe(true)
  })

  it('returns false for wrong bot token', () => {
    const initData = createSignedInitData(validParams, TEST_BOT_TOKEN)
    expect(validateInitData(initData, 'wrong:token')).toBe(false)
  })

  it('returns false for tampered data', () => {
    const initData = createSignedInitData(validParams, TEST_BOT_TOKEN)
    const tampered = initData.replace('Alice', 'Mallory')
    expect(validateInitData(tampered, TEST_BOT_TOKEN)).toBe(false)
  })

  it('returns false when hash is missing', () => {
    const params = new URLSearchParams(validParams)
    expect(validateInitData(params.toString(), TEST_BOT_TOKEN)).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(validateInitData('', TEST_BOT_TOKEN)).toBe(false)
  })

  it('handles data with additional fields', () => {
    const extendedParams = {
      ...validParams,
      start_param: 'ref_campaign42',
    }
    const initData = createSignedInitData(extendedParams, TEST_BOT_TOKEN)
    expect(validateInitData(initData, TEST_BOT_TOKEN)).toBe(true)
  })

  it('is order-independent (params in any order produce same hash)', () => {
    const initData1 = createSignedInitData(validParams, TEST_BOT_TOKEN)

    const reversed: Record<string, string> = {}
    for (const key of Object.keys(validParams).reverse()) {
      reversed[key] = validParams[key as keyof typeof validParams]
    }
    const initData2 = createSignedInitData(reversed, TEST_BOT_TOKEN)

    expect(validateInitData(initData1, TEST_BOT_TOKEN)).toBe(true)
    expect(validateInitData(initData2, TEST_BOT_TOKEN)).toBe(true)
  })
})
