import { describe, it, expect, expectTypeOf } from 'vitest'
import { ResultError, isResultError } from '../result-error.js'
import { err } from '../result.js'
import { matchOn } from '../match.js'

describe('ResultError', () => {
  it('creates a branded error with code and message', () => {
    const e = new ResultError('NOT_FOUND', 'User not found')
    expect(e.code).toBe('NOT_FOUND')
    expect(e.message).toBe('User not found')
    expect(e).toBeInstanceOf(ResultError)
    expect(e).toBeInstanceOf(Error)
  })

  it('supports optional context data', () => {
    const e = new ResultError('VALIDATION', 'Bad input', { field: 'email' })
    expect(e.context).toEqual({ field: 'email' })
  })

  it('defaults context to undefined', () => {
    const e = new ResultError('TIMEOUT', 'Timed out')
    expect(e.context).toBeUndefined()
  })

  it('works with matchOn on the code discriminant', () => {
    type AppError =
      | ResultError<'NOT_FOUND'>
      | ResultError<'TIMEOUT'>

    const error: AppError = new ResultError('NOT_FOUND', 'missing')
    const result = matchOn(error, 'code', {
      NOT_FOUND: (e: ResultError<'NOT_FOUND'>) => `missing: ${e.message}`,
      TIMEOUT: (e: ResultError<'TIMEOUT'>) => `slow: ${e.message}`
    })
    expect(result).toBe('missing: missing')
  })

  it('works naturally with err()', () => {
    const result = err(new ResultError('PARSE', 'bad json'))
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.code).toBe('PARSE')
    }
  })
})

describe('isResultError()', () => {
  it('returns true for ResultError instances', () => {
    expect(isResultError(new ResultError('X', 'x'))).toBe(true)
  })

  it('returns false for plain Error', () => {
    expect(isResultError(new Error('x'))).toBe(false)
  })

  it('returns false for non-errors', () => {
    expect(isResultError('string')).toBe(false)
    expect(isResultError(null)).toBe(false)
  })

  it('narrows type', () => {
    const e: unknown = new ResultError('TEST', 'test')
    if (isResultError(e)) {
      expectTypeOf(e).toEqualTypeOf<ResultError<string>>()
      expect(e.code).toBe('TEST')
    }
  })
})
