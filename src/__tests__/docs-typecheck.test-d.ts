import { describe, it, expectTypeOf } from 'vitest'
import { ok, err, fromThrowable, fromNullable, combine, match, ResultError, isResultError, okAsync, ResultAsync } from '../index.js'
import type { Result, InferOkType, InferErrType, ResultJSON } from '../index.js'

describe('docs type claims', () => {
  it('ok returns Ok<T, never>', () => {
    expectTypeOf(ok(42)).toMatchTypeOf<Result<number, never>>()
  })

  it('err returns Err<never, E>', () => {
    expectTypeOf(err('bad')).toMatchTypeOf<Result<never, string>>()
  })

  it('fromThrowable infers error type from errorFn', () => {
    const safe = fromThrowable(
      (s: string) => JSON.parse(s) as number,
      () => 'parse_error' as const
    )
    expectTypeOf(safe).toEqualTypeOf<(s: string) => Result<number, 'parse_error'>>()
  })

  it('fromNullable returns Result<T, E>', () => {
    const r = fromNullable('hello' as string | null, 'missing' as const)
    expectTypeOf(r).toEqualTypeOf<Result<string, 'missing'>>()
  })

  it('combine infers tuple types', () => {
    const r = combine([ok<number, 'a'>(1), ok<string, 'b'>('x')] as const)
    expectTypeOf(r).toEqualTypeOf<Result<[number, string], 'a' | 'b'>>()
  })

  it('InferOkType extracts T from Result', () => {
    type R = Result<number, string>
    expectTypeOf<InferOkType<R>>().toEqualTypeOf<number>()
  })

  it('InferErrType extracts E from Result', () => {
    type R = Result<number, string>
    expectTypeOf<InferErrType<R>>().toEqualTypeOf<string>()
  })

  it('InferOkType works on ResultAsync', () => {
    type R = ResultAsync<boolean, string>
    expectTypeOf<InferOkType<R>>().toEqualTypeOf<boolean>()
  })

  it('isResultError narrows unknown to ResultError', () => {
    const unk: unknown = new ResultError('X', 'x')
    if (isResultError(unk)) {
      expectTypeOf(unk).toEqualTypeOf<ResultError<string>>()
    }
  })

  it('match is exhaustive on string union', () => {
    type Color = 'red' | 'green' | 'blue'
    const c: Color = 'red'
    const result = match(c, {
      red: () => 1,
      green: () => 2,
      blue: () => 3
    })
    expectTypeOf(result).toEqualTypeOf<number>()
  })
})
