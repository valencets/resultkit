import { describe, it, expect } from 'vitest'
import { ok, err } from '../result.js'
import { resultToJSON, resultFromJSON, parseResultJSON } from '../serialization.js'

describe('resultToJSON()', () => {
  it('serializes Ok', () => {
    expect(resultToJSON(ok(42))).toEqual({ _tag: 'Ok', value: 42 })
  })

  it('serializes Err', () => {
    expect(resultToJSON(err('bad'))).toEqual({ _tag: 'Err', error: 'bad' })
  })

  it('serializes complex values', () => {
    expect(resultToJSON(ok({ id: 1, name: 'alice' }))).toEqual({
      _tag: 'Ok',
      value: { id: 1, name: 'alice' }
    })
  })

  it('round-trips through JSON.stringify/parse', () => {
    const original = ok({ nested: [1, 2, 3] })
    const json = JSON.stringify(resultToJSON(original))
    const restored = resultFromJSON(JSON.parse(json))
    expect(restored.isOk()).toBe(true)
    if (restored.isOk()) expect(restored.value).toEqual({ nested: [1, 2, 3] })
  })
})

describe('resultFromJSON()', () => {
  it('deserializes Ok', () => {
    const result = resultFromJSON({ _tag: 'Ok', value: 42 })
    expect(result.isOk()).toBe(true)
    if (result.isOk()) expect(result.value).toBe(42)
  })

  it('deserializes Err', () => {
    const result = resultFromJSON({ _tag: 'Err', error: 'bad' })
    expect(result.isErr()).toBe(true)
    if (result.isErr()) expect(result.error).toBe('bad')
  })

  it('throws on invalid tag', () => {
    expect(() => resultFromJSON({ _tag: 'Invalid' })).toThrow('Invalid Result JSON')
  })

  it('throws on missing tag', () => {
    expect(() => resultFromJSON({ value: 42 })).toThrow('Invalid Result JSON')
  })

  it('throws on invalid input that parseResultJSON would reject (strict)', () => {
    expect(() => resultFromJSON({ _tag: 'Ok', value: null })).toThrow('Invalid Result JSON')
  })
})

describe('parseResultJSON() strict untrusted parser', () => {
  it('parses valid Ok and Err', () => {
    const okResult = parseResultJSON<number, string>({ _tag: 'Ok', value: 42 })
    const errResult = parseResultJSON<number, string>({ _tag: 'Err', error: 'boom' })

    expect(okResult.isOk()).toBe(true)
    expect(errResult.isErr()).toBe(true)
  })

  it.each([
    null,
    undefined,
    'not-json',
    { _tag: 'Nope' },
    { _tag: 'Ok' },
    { _tag: 'Err' },
    { _tag: 'Ok', value: undefined },
    { _tag: 'Ok', value: null },
    { _tag: 'Err', error: undefined },
    { _tag: 'Err', error: null },
  ])('returns typed Err for invalid input %o (strict)', (input) => {
    const r = parseResultJSON<number, string>(input as any)
    expect(r.isErr()).toBe(true)
    if (r.isErr()) {
      expect(r.error.code).toBe('INVALID_RESULT_JSON')
    }
  })
})
