import { describe, it, expect } from 'vitest'
import { okAsync, errAsync, ResultAsync } from '../result-async.js'

describe('okAsync()', () => {
  it('creates an async Ok', async () => {
    const result = await okAsync(5)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value).toBe(5)
    }
  })
})

describe('errAsync()', () => {
  it('creates an async Err', async () => {
    const result = await errAsync('bad')
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error).toBe('bad')
    }
  })
})

describe('ResultAsync.fromPromise()', () => {
  it('wraps a resolved promise into Ok', async () => {
    const result = await ResultAsync.fromPromise(
      Promise.resolve(42),
      () => 'error'
    )
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value).toBe(42)
    }
  })

  it('wraps a rejected promise into Err', async () => {
    const result = await ResultAsync.fromPromise(
      Promise.reject(new Error('boom')),
      (e) => (e instanceof Error ? e.message : 'unknown')
    )
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error).toBe('boom')
    }
  })

  it('maps the rejection with errorFn', async () => {
    const result = await ResultAsync.fromPromise(
      Promise.reject(new Error('network')),
      () => ({ code: 'NETWORK', message: 'failed' })
    )
    if (result.isErr()) {
      expect(result.error).toEqual({ code: 'NETWORK', message: 'failed' })
    }
  })
})

describe('ResultAsync.fromSafePromise()', () => {
  it('wraps a resolved promise into Ok', async () => {
    const result = await ResultAsync.fromSafePromise(Promise.resolve(10))
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value).toBe(10)
    }
  })
})

describe('PromiseLike conformance', () => {
  it('can be awaited directly', async () => {
    const result = await okAsync(99)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value).toBe(99)
    }
  })

  it('works with Promise.resolve()', async () => {
    const result = await Promise.resolve(okAsync(7))
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value).toBe(7)
    }
  })
})
