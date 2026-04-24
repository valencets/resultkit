import { describe, it, expect } from 'vitest'
import { ok, err } from '../result.js'
import { okAsync, errAsync } from '../result-async.js'
import { combine, combineAsync } from '../combine.js'

describe('combine()', () => {
  it('returns Ok with all values when all results are Ok', () => {
    const result = combine([ok(1), ok(2), ok(3)])
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value).toEqual([1, 2, 3])
    }
  })

  it('returns the first Err when any result is Err', () => {
    const result = combine([ok(1), err('bad'), ok(3)])
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error).toBe('bad')
    }
  })

  it('returns Ok with empty array for empty input', () => {
    const result = combine([])
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value).toEqual([])
    }
  })

  it('returns the first Err encountered (not the last)', () => {
    const result = combine([err('first'), err('second')])
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error).toBe('first')
    }
  })
})

describe('combineAsync()', () => {
  it('returns Ok with all values when all are Ok', async () => {
    const result = await combineAsync([okAsync(1), okAsync(2), okAsync(3)])
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value).toEqual([1, 2, 3])
    }
  })

  it('returns the first Err when any is Err', async () => {
    const result = await combineAsync([okAsync(1), errAsync('bad'), okAsync(3)])
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error).toBe('bad')
    }
  })

  it('returns Ok with empty array for empty input', async () => {
    const result = await combineAsync([])
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value).toEqual([])
    }
  })
})
