import { describe, it, expect } from 'vitest'
import { okAsync, errAsync } from '../result-async.js'

describe('ResultAsync.unwrap()', () => {
  it('returns the value for Ok', async () => {
    expect(await okAsync(5).unwrap()).toBe(5)
  })

  it('throws for Err with cause', async () => {
    await expect(errAsync('bad').unwrap()).rejects.toThrow('Called unwrap on an Err value: bad')
  })
})

describe('ResultAsync.unwrapErr()', () => {
  it('returns the error for Err', async () => {
    expect(await errAsync('bad').unwrapErr()).toBe('bad')
  })

  it('throws for Ok with cause', async () => {
    await expect(okAsync(5).unwrapErr()).rejects.toThrow('Called unwrapErr on an Ok value')
  })
})

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
