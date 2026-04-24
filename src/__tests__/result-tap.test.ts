import { describe, it, expect, vi } from 'vitest'
import { ok, err } from '../result.js'

describe('.tap()', () => {
  it('calls fn with the value on Ok and returns the same Ok', () => {
    const spy = vi.fn()
    const result = ok(5).tap(spy)
    expect(spy).toHaveBeenCalledWith(5)
    expect(result.isOk() && result.value).toBe(5)
  })

  it('does not call fn on Err and returns the same Err', () => {
    const spy = vi.fn()
    const result = err<number, string>('bad').tap(spy)
    expect(spy).not.toHaveBeenCalled()
    expect(result.isErr() && result.error).toBe('bad')
  })

  it('returns the exact same reference (no allocation)', () => {
    const original = ok(42)
    expect(original.tap(() => {})).toBe(original)
  })
})

describe('.tapErr()', () => {
  it('calls fn with the error on Err and returns the same Err', () => {
    const spy = vi.fn()
    const result = err<number, string>('bad').tapErr(spy)
    expect(spy).toHaveBeenCalledWith('bad')
    expect(result.isErr() && result.error).toBe('bad')
  })

  it('does not call fn on Ok and returns the same Ok', () => {
    const spy = vi.fn()
    const result = ok<number, string>(5).tapErr(spy)
    expect(spy).not.toHaveBeenCalled()
    expect(result.isOk() && result.value).toBe(5)
  })

  it('returns the exact same reference (no allocation)', () => {
    const original = err('oops')
    expect(original.tapErr(() => {})).toBe(original)
  })
})
