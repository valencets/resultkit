import { describe, it, expect } from 'vitest'
import { fromThrowableAsync } from '../from-throwable-async.js'

describe('fromThrowableAsync() sync throw', () => {
  it('catches a synchronous throw in the wrapped function', async () => {
    const bad = fromThrowableAsync(
      () => { throw new Error('sync boom') },
      (e) => (e instanceof Error ? e.message : 'unknown')
    )
    const result = await bad()
    expect(result.isErr()).toBe(true)
    if (result.isErr()) expect(result.error).toBe('sync boom')
  })
})
