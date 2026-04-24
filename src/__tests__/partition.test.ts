import { describe, it, expect } from 'vitest'
import { ok, err } from '../result.js'
import { partition } from '../partition.js'

describe('partition()', () => {
  it('splits results into ok values and err values', () => {
    const [oks, errs] = partition([ok(1), err('bad'), ok(3), err('worse')])
    expect(oks).toEqual([1, 3])
    expect(errs).toEqual(['bad', 'worse'])
  })

  it('returns empty arrays for empty input', () => {
    const [oks, errs] = partition([])
    expect(oks).toEqual([])
    expect(errs).toEqual([])
  })

  it('handles all Ok', () => {
    const [oks, errs] = partition([ok(1), ok(2)])
    expect(oks).toEqual([1, 2])
    expect(errs).toEqual([])
  })

  it('handles all Err', () => {
    const [oks, errs] = partition([err('a'), err('b')])
    expect(oks).toEqual([])
    expect(errs).toEqual(['a', 'b'])
  })
})
