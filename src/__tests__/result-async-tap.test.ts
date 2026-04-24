import { describe, it, expect, vi } from 'vitest'
import { okAsync, errAsync } from '../result-async.js'

describe('ResultAsync.tap()', () => {
  it('calls fn with the value on Ok and resolves to the same value', async () => {
    const spy = vi.fn()
    const result = await okAsync(5).tap(spy)
    expect(spy).toHaveBeenCalledWith(5)
    expect(result.isOk() && result.value).toBe(5)
  })

  it('does not call fn on Err', async () => {
    const spy = vi.fn()
    const result = await errAsync<number, string>('bad').tap(spy)
    expect(spy).not.toHaveBeenCalled()
    expect(result.isErr() && result.error).toBe('bad')
  })
})

describe('ResultAsync.tapErr()', () => {
  it('calls fn with the error on Err and resolves to the same error', async () => {
    const spy = vi.fn()
    const result = await errAsync<number, string>('bad').tapErr(spy)
    expect(spy).toHaveBeenCalledWith('bad')
    expect(result.isErr() && result.error).toBe('bad')
  })

  it('does not call fn on Ok', async () => {
    const spy = vi.fn()
    const result = await okAsync<number, string>(5).tapErr(spy)
    expect(spy).not.toHaveBeenCalled()
    expect(result.isOk() && result.value).toBe(5)
  })
})
