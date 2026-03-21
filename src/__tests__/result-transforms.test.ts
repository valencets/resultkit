import { describe, it, expect } from 'vitest'
import { ok, err } from '../result.js'

describe('.map()', () => {
  it('transforms the Ok value', () => {
    const result = ok(5).map((n) => n * 2)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value).toBe(10)
    }
  })

  it('passes through Err unchanged', () => {
    const result = err<number, string>('bad').map((n) => n * 2)
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error).toBe('bad')
    }
  })

  it('can change the value type', () => {
    const result = ok(5).map((n) => String(n))
    if (result.isOk()) {
      expect(result.value).toBe('5')
    }
  })
})

describe('.mapErr()', () => {
  it('transforms the Err value', () => {
    const result = err<number, string>('bad').mapErr((s) => s.toUpperCase())
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error).toBe('BAD')
    }
  })

  it('passes through Ok unchanged', () => {
    const result = ok<number, string>(5).mapErr((s) => s.toUpperCase())
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value).toBe(5)
    }
  })

  it('can change the error type', () => {
    const result = err<number, string>('not found').mapErr((s) => ({ code: s }))
    if (result.isErr()) {
      expect(result.error).toEqual({ code: 'not found' })
    }
  })
})

describe('.andThen()', () => {
  it('chains Ok into another Ok', () => {
    const result = ok(5).andThen((n) => ok(n * 2))
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value).toBe(10)
    }
  })

  it('chains Ok into Err', () => {
    const result = ok(5).andThen(() => err('failed'))
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error).toBe('failed')
    }
  })

  it('short-circuits on Err', () => {
    let called = false
    const result = err<number, string>('bad').andThen((n) => {
      called = true
      return ok(n * 2)
    })
    expect(called).toBe(false)
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error).toBe('bad')
    }
  })

  it('supports multi-step chains', () => {
    const divide = (a: number, b: number) =>
      b === 0 ? err('division by zero' as const) : ok(a / b)

    const result = ok(100)
      .andThen((n) => divide(n, 5))
      .andThen((n) => divide(n, 2))

    if (result.isOk()) {
      expect(result.value).toBe(10)
    }
  })

  it('stops chain at first error', () => {
    const divide = (a: number, b: number) =>
      b === 0 ? err('division by zero' as const) : ok(a / b)

    const result = ok(100)
      .andThen((n) => divide(n, 0))
      .andThen((n) => divide(n, 2))

    if (result.isErr()) {
      expect(result.error).toBe('division by zero')
    }
  })
})

describe('.orElse()', () => {
  it('recovers from Err', () => {
    const result = err<number, string>('bad').orElse(() => ok(0))
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value).toBe(0)
    }
  })

  it('passes through Ok', () => {
    const result = ok<number, string>(5).orElse(() => ok(0))
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value).toBe(5)
    }
  })

  it('can convert to a different error', () => {
    const result = err<number, string>('bad').orElse((e) => err({ original: e }))
    if (result.isErr()) {
      expect(result.error).toEqual({ original: 'bad' })
    }
  })
})
