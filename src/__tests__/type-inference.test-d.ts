import { describe, it, expectTypeOf } from 'vitest'
import { ok, err, Ok, Err } from '../result.js'
import type { Result } from '../result.js'
import { okAsync, errAsync, ResultAsync } from '../result-async.js'
import { fromThrowable } from '../from-throwable.js'
import type { InferOkType, InferErrType } from '../types.js'

describe('ok() type inference', () => {
  it('infers Ok<number, never>', () => {
    const result = ok(5)
    expectTypeOf(result).toEqualTypeOf<Ok<number, never>>()
  })

  it('infers Ok<string, never>', () => {
    const result = ok('hello')
    expectTypeOf(result).toEqualTypeOf<Ok<string, never>>()
  })
})

describe('err() type inference', () => {
  it('infers Err<never, string>', () => {
    const result = err('bad')
    expectTypeOf(result).toEqualTypeOf<Err<never, string>>()
  })
})

describe('type narrowing', () => {
  it('narrows Ok to access .value', () => {
    const result: Result<number, string> = ok(5)
    if (result.isOk()) {
      expectTypeOf(result.value).toEqualTypeOf<number>()
    }
  })

  it('narrows Err to access .error', () => {
    const result: Result<number, string> = err('bad')
    if (result.isErr()) {
      expectTypeOf(result.error).toEqualTypeOf<string>()
    }
  })
})

describe('.map() type inference', () => {
  it('transforms the Ok type', () => {
    const result = ok(5).map((n) => String(n))
    expectTypeOf(result).toEqualTypeOf<Result<string, never>>()
  })
})

describe('.andThen() type inference', () => {
  it('accumulates error types', () => {
    const result = ok<number, string>(5).andThen((n) =>
      n > 0 ? ok(n) : err(42 as const)
    )
    expectTypeOf(result).toEqualTypeOf<Result<number, string | 42>>()
  })
})

describe('.match() type inference', () => {
  it('returns union of branch types', () => {
    const result = ok<number, string>(5).match(
      (v) => v * 2,
      (e) => e.length
    )
    expectTypeOf(result).toEqualTypeOf<number>()
  })
})

describe('ResultAsync type inference', () => {
  it('okAsync infers correctly', () => {
    const result = okAsync(5)
    expectTypeOf(result).toEqualTypeOf<ResultAsync<number, never>>()
  })

  it('errAsync infers correctly', () => {
    const result = errAsync('bad')
    expectTypeOf(result).toEqualTypeOf<ResultAsync<never, string>>()
  })

  it('fromPromise infers correctly', () => {
    const result = ResultAsync.fromPromise(
      Promise.resolve(5),
      () => 'error' as const
    )
    expectTypeOf(result).toEqualTypeOf<ResultAsync<number, 'error'>>()
  })
})

describe('fromThrowable type inference', () => {
  it('preserves parameter types with errorFn', () => {
    const safeFn = fromThrowable(
      (a: number, b: string) => `${a}${b}`,
      () => 'error' as const
    )
    expectTypeOf(safeFn).toEqualTypeOf<(a: number, b: string) => Result<string, 'error'>>()
  })

  it('requires errorFn and infers the error type from it', () => {
    const safeFn = fromThrowable(
      (s: string) => JSON.parse(s) as number,
      () => 'parse_error' as const
    )
    expectTypeOf(safeFn).toEqualTypeOf<(s: string) => Result<number, 'parse_error'>>()
  })
})

describe('InferOkType / InferErrType', () => {
  it('extracts Ok type from Result', () => {
    type R = Result<number, string>
    expectTypeOf<InferOkType<R>>().toEqualTypeOf<number>()
  })

  it('extracts Err type from Result', () => {
    type R = Result<number, string>
    expectTypeOf<InferErrType<R>>().toEqualTypeOf<string>()
  })

  it('extracts Ok type from ResultAsync', () => {
    type R = ResultAsync<number, string>
    expectTypeOf<InferOkType<R>>().toEqualTypeOf<number>()
  })

  it('extracts Err type from ResultAsync', () => {
    type R = ResultAsync<number, string>
    expectTypeOf<InferErrType<R>>().toEqualTypeOf<string>()
  })
})
