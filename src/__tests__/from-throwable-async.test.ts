import { describe, it, expect } from 'vitest'
import { fromThrowableAsync } from '../from-throwable-async.js'

describe('fromThrowableAsync()', () => {
  it('wraps an async function that resolves into Ok', async () => {
    const safeFetch = fromThrowableAsync(
      async (id: number) => ({ id, name: 'alice' }),
      (e) => (e instanceof Error ? e.message : 'unknown')
    )
    const result = await safeFetch(1)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) expect(result.value).toEqual({ id: 1, name: 'alice' })
  })

  it('wraps an async function that rejects into Err', async () => {
    const safeFetch = fromThrowableAsync(
      async () => { throw new Error('network') },
      (e) => (e instanceof Error ? e.message : 'unknown')
    )
    const result = await safeFetch()
    expect(result.isErr()).toBe(true)
    if (result.isErr()) expect(result.error).toBe('network')
  })

  it('uses raw error when no errorFn provided', async () => {
    const safeFetch = fromThrowableAsync(
      async () => { throw new Error('boom') }
    )
    const result = await safeFetch()
    expect(result.isErr()).toBe(true)
    if (result.isErr()) expect(result.error).toBeInstanceOf(Error)
  })

  it('passes arguments through', async () => {
    const safeAdd = fromThrowableAsync(
      async (a: number, b: number) => a + b,
      () => 'error'
    )
    const result = await safeAdd(3, 4)
    if (result.isOk()) expect(result.value).toBe(7)
  })
})
