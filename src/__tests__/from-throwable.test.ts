import { describe, it, expect } from 'vitest'
import { fromThrowable } from '../from-throwable.js'

describe('fromThrowable()', () => {
  it('wraps a function that succeeds into Ok', () => {
    const safeParse = fromThrowable(
      (s: string) => JSON.parse(s) as Record<string, unknown>,
      (e) => (e instanceof Error ? e.message : 'parse error')
    )
    const result = safeParse('{"a":1}')
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value).toEqual({ a: 1 })
    }
  })

  it('wraps a function that throws into Err', () => {
    const safeParse = fromThrowable(
      (s: string) => JSON.parse(s) as Record<string, unknown>,
      (e) => (e instanceof Error ? e.message : 'parse error')
    )
    const result = safeParse('not json')
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(typeof result.error).toBe('string')
    }
  })

  it('passes through arguments to the wrapped function', () => {
    const safeAdd = fromThrowable(
      (a: number, b: number) => a + b,
      () => 'error'
    )
    const result = safeAdd(3, 4)
    if (result.isOk()) {
      expect(result.value).toBe(7)
    }
  })

  it('uses raw error when no errorFn provided', () => {
    const safeParse = fromThrowable(
      (s: string) => JSON.parse(s) as Record<string, unknown>
    )
    const result = safeParse('not json')
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(SyntaxError)
    }
  })

  it('works with zero-argument functions', () => {
    const safeRandom = fromThrowable(
      () => Math.random(),
      () => 'error'
    )
    const result = safeRandom()
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(typeof result.value).toBe('number')
    }
  })

  it('maps errors with the errorFn', () => {
    const safeParse = fromThrowable(
      (s: string) => JSON.parse(s) as Record<string, unknown>,
      () => ({ code: 'PARSE_FAILED', message: 'invalid json' })
    )
    const result = safeParse('{bad}')
    if (result.isErr()) {
      expect(result.error).toEqual({ code: 'PARSE_FAILED', message: 'invalid json' })
    }
  })
})
