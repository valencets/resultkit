import { describe, it, expect } from 'vitest'
import { ok, err } from '../result.js'
import { resultToJSON, resultFromJSON } from '../serialization.js'

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
})
