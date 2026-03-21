import { describe, it, expect } from 'vitest'
import { okAsync, errAsync } from '../result-async.js'

describe('ResultAsync.match()', () => {
  it('calls okFn for Ok', async () => {
    const result = await okAsync(5).match(
      (v) => v * 2,
      () => 0
    )
    expect(result).toBe(10)
  })

  it('calls errFn for Err', async () => {
    const result = await errAsync<number, string>('bad').match(
      (v) => v * 2,
      () => -1
    )
    expect(result).toBe(-1)
  })

  it('passes the error to errFn', async () => {
    const result = await errAsync<number, string>('oops').match(
      () => 'ok',
      (e) => `error: ${e}`
    )
    expect(result).toBe('error: oops')
  })
})

describe('ResultAsync.unwrapOr()', () => {
  it('returns value for Ok', async () => {
    const result = await okAsync(5).unwrapOr(42)
    expect(result).toBe(5)
  })

  it('returns default for Err', async () => {
    const result = await errAsync<number, string>('bad').unwrapOr(42)
    expect(result).toBe(42)
  })
})
