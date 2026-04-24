import { describe, it, expect } from 'vitest'
import { fromNullable } from '../from-nullable.js'

describe('fromNullable()', () => {
  it('returns Ok for a non-null value', () => {
    const result = fromNullable(42, 'was null')
    expect(result.isOk()).toBe(true)
    if (result.isOk()) expect(result.value).toBe(42)
  })

  it('returns Err for null', () => {
    const result = fromNullable(null, 'was null')
    expect(result.isErr()).toBe(true)
    if (result.isErr()) expect(result.error).toBe('was null')
  })

  it('returns Err for undefined', () => {
    const result = fromNullable(undefined, 'missing')
    expect(result.isErr()).toBe(true)
    if (result.isErr()) expect(result.error).toBe('missing')
  })

  it('treats 0 and empty string as Ok', () => {
    expect(fromNullable(0, 'err').isOk()).toBe(true)
    expect(fromNullable('', 'err').isOk()).toBe(true)
    expect(fromNullable(false, 'err').isOk()).toBe(true)
  })
})
