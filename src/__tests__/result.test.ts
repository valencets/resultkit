import { describe, it, expect } from 'vitest'
import { ok, err, Ok, Err } from '../result.js'
import { ResultAsync } from '../result-async.js'

describe('ok()', () => {
  it('creates an Ok with the given value', () => {
    const result = ok(5)
    expect(result).toBeInstanceOf(Ok)
    expect(result.value).toBe(5)
  })

  it('works with complex types', () => {
    const result = ok({ name: 'alice', age: 30 })
    expect(result.value).toEqual({ name: 'alice', age: 30 })
  })

  it('works with null and undefined values', () => {
    expect(ok(null).value).toBe(null)
    expect(ok(undefined).value).toBe(undefined)
  })
})

describe('err()', () => {
  it('creates an Err with the given error', () => {
    const result = err('something went wrong')
    expect(result).toBeInstanceOf(Err)
    expect(result.error).toBe('something went wrong')
  })

  it('works with error objects', () => {
    const error = { code: 'NOT_FOUND', message: 'not found' }
    const result = err(error)
    expect(result.error).toEqual({ code: 'NOT_FOUND', message: 'not found' })
  })
})

describe('isOk() / isErr()', () => {
  it('Ok.isOk() returns true', () => {
    expect(ok(1).isOk()).toBe(true)
  })

  it('Ok.isErr() returns false', () => {
    expect(ok(1).isErr()).toBe(false)
  })

  it('Err.isOk() returns false', () => {
    expect(err('bad').isOk()).toBe(false)
  })

  it('Err.isErr() returns true', () => {
    expect(err('bad').isErr()).toBe(true)
  })

  it('narrows type so .value is accessible after isOk() guard', () => {
    const result = ok(42) as ReturnType<typeof ok<number>> | ReturnType<typeof err<never, string>>
    if (result.isOk()) {
      // TypeScript knows result.value exists here
      expect(result.value).toBe(42)
    }
  })

  it('narrows type so .error is accessible after isErr() guard', () => {
    const result = err('bad') as ReturnType<typeof ok<number>> | ReturnType<typeof err<never, string>>
    if (result.isErr()) {
      // TypeScript knows result.error exists here
      expect(result.error).toBe('bad')
    }
  })
})

describe('.toAsync()', () => {
  it('converts Ok to ResultAsync', async () => {
    const asyncResult = ok(5).toAsync()
    expect(asyncResult).toBeInstanceOf(ResultAsync)
    const result = await asyncResult
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value).toBe(5)
    }
  })

  it('converts Err to ResultAsync', async () => {
    const asyncResult = err<number, string>('bad').toAsync()
    expect(asyncResult).toBeInstanceOf(ResultAsync)
    const result = await asyncResult
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error).toBe('bad')
    }
  })
})
