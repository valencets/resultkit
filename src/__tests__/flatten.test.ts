import { describe, it, expect } from 'vitest'
import { ok, err } from '../result.js'
import { flatten } from '../flatten.js'

describe('flatten()', () => {
  it('unwraps Ok(Ok(value)) to Ok(value)', () => {
    const nested = ok(ok(42))
    const result = flatten(nested)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) expect(result.value).toBe(42)
  })

  it('unwraps Ok(Err(error)) to Err(error)', () => {
    const nested = ok(err('inner'))
    const result = flatten(nested)
    expect(result.isErr()).toBe(true)
    if (result.isErr()) expect(result.error).toBe('inner')
  })

  it('passes through outer Err unchanged', () => {
    const nested = err<typeof ok<number>, string>('outer')
    const result = flatten(nested)
    expect(result.isErr()).toBe(true)
    if (result.isErr()) expect(result.error).toBe('outer')
  })
})
