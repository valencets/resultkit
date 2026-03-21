import { describe, it, expect } from 'vitest'
import { ok, err } from '../result.js'
import { okAsync, errAsync, ResultAsync } from '../result-async.js'

describe('ResultAsync.map()', () => {
  it('transforms the Ok value', async () => {
    const result = await okAsync(5).map((n) => n * 2)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value).toBe(10)
    }
  })

  it('passes through Err unchanged', async () => {
    const result = await errAsync<number, string>('bad').map((n) => n * 2)
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error).toBe('bad')
    }
  })

  it('supports async mapper', async () => {
    const result = await okAsync(5).map(async (n) => n * 3)
    if (result.isOk()) {
      expect(result.value).toBe(15)
    }
  })
})

describe('ResultAsync.mapErr()', () => {
  it('transforms the Err value', async () => {
    const result = await errAsync<number, string>('bad').mapErr((s) => s.toUpperCase())
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error).toBe('BAD')
    }
  })

  it('passes through Ok unchanged', async () => {
    const result = await okAsync<number, string>(5).mapErr((s) => s.toUpperCase())
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value).toBe(5)
    }
  })

  it('supports async mapper', async () => {
    const result = await errAsync<number, string>('bad').mapErr(async (s) => s.length)
    if (result.isErr()) {
      expect(result.error).toBe(3)
    }
  })
})

describe('ResultAsync.andThen()', () => {
  it('chains with sync Result', async () => {
    const result = await okAsync(5).andThen((n) => ok(n * 2))
    if (result.isOk()) {
      expect(result.value).toBe(10)
    }
  })

  it('chains with ResultAsync', async () => {
    const result = await okAsync(5).andThen((n) => okAsync(n * 2))
    if (result.isOk()) {
      expect(result.value).toBe(10)
    }
  })

  it('chains Ok into Err', async () => {
    const result = await okAsync(5).andThen(() => err('failed'))
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error).toBe('failed')
    }
  })

  it('short-circuits on Err', async () => {
    let called = false
    const result = await errAsync<number, string>('bad').andThen((n) => {
      called = true
      return ok(n * 2)
    })
    expect(called).toBe(false)
    expect(result.isErr()).toBe(true)
  })

  it('supports multi-step async chains', async () => {
    const fetchUser = (id: number) =>
      ResultAsync.fromPromise(
        Promise.resolve({ id, name: 'alice' }),
        () => 'fetch failed'
      )

    const result = await okAsync(1)
      .andThen((id) => fetchUser(id))
      .map((user) => user.name)

    if (result.isOk()) {
      expect(result.value).toBe('alice')
    }
  })
})

describe('ResultAsync.orElse()', () => {
  it('recovers from Err with sync Result', async () => {
    const result = await errAsync<number, string>('bad').orElse(() => ok(0))
    if (result.isOk()) {
      expect(result.value).toBe(0)
    }
  })

  it('recovers from Err with ResultAsync', async () => {
    const result = await errAsync<number, string>('bad').orElse(() => okAsync(0))
    if (result.isOk()) {
      expect(result.value).toBe(0)
    }
  })

  it('passes through Ok', async () => {
    const result = await okAsync<number, string>(5).orElse(() => ok(0))
    if (result.isOk()) {
      expect(result.value).toBe(5)
    }
  })

  it('remaps error to different error', async () => {
    const result = await errAsync<number, string>('bad').orElse((e) => err({ original: e }))
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error).toEqual({ original: 'bad' })
    }
  })
})
