import { describe, it, expect } from 'vitest'
import { ok, err } from '../result.js'

describe('.match()', () => {
  it('calls okFn for Ok', () => {
    const result = ok(5).match(
      (v) => v * 2,
      () => 0
    )
    expect(result).toBe(10)
  })

  it('calls errFn for Err', () => {
    const result = err<number, string>('bad').match(
      (v) => v * 2,
      () => -1
    )
    expect(result).toBe(-1)
  })

  it('passes the error to errFn', () => {
    const result = err<number, string>('oops').match(
      () => 'ok',
      (e) => `error: ${e}`
    )
    expect(result).toBe('error: oops')
  })

  it('can return different types from ok and err branches', () => {
    const okResult = ok<number, string>(5).match(
      (v) => ({ value: v }),
      (e) => ({ error: e })
    )
    expect(okResult).toEqual({ value: 5 })

    const errResult = err<number, string>('bad').match(
      (v) => ({ value: v }),
      (e) => ({ error: e })
    )
    expect(errResult).toEqual({ error: 'bad' })
  })
})

describe('.unwrapOr()', () => {
  it('returns value for Ok', () => {
    expect(ok(5).unwrapOr(42)).toBe(5)
  })

  it('returns default for Err', () => {
    expect(err<number, string>('bad').unwrapOr(42)).toBe(42)
  })

  it('works with different default type', () => {
    expect(err<number, string>('bad').unwrapOr('fallback')).toBe('fallback')
  })
})

describe('.unwrap()', () => {
  it('returns value for Ok', () => {
    expect(ok(5).unwrap()).toBe(5)
  })

  it('throws for Err with the error value as cause', () => {
    const thrown = (() => { try { err('bad').unwrap(); return null } catch (e) { return e } })()
    expect(thrown).toBeInstanceOf(Error)
    expect((thrown as Error).message).toBe('Called unwrap on an Err value: bad')
    expect((thrown as Error).cause).toBe('bad')
  })

  it('includes string error in message', () => {
    expect(() => err('bad').unwrap()).toThrow('Called unwrap on an Err value: bad')
  })

  it('includes object error as cause', () => {
    const errObj = { code: 'NOT_FOUND' }
    const thrown = (() => { try { err(errObj).unwrap(); return null } catch (e) { return e } })()
    expect((thrown as Error).cause).toEqual({ code: 'NOT_FOUND' })
  })
})

describe('.unwrapErr()', () => {
  it('returns error for Err', () => {
    expect(err('bad').unwrapErr()).toBe('bad')
  })

  it('throws for Ok with the value as cause', () => {
    const thrown = (() => { try { ok(5).unwrapErr(); return null } catch (e) { return e } })()
    expect(thrown).toBeInstanceOf(Error)
    expect((thrown as Error).message).toBe('Called unwrapErr on an Ok value')
    expect((thrown as Error).cause).toBe(5)
  })
})
