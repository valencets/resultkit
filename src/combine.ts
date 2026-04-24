import { ok, err } from './result.js'
import type { Result } from './result.js'
import { ResultAsync } from './result-async.js'

type CombineOkTypes<T extends readonly Result<unknown, unknown>[]> = {
  [K in keyof T]: T[K] extends Result<infer U, unknown> ? U : never
}

type CombineErrTypes<T extends readonly Result<unknown, unknown>[]> =
  T[number] extends Result<unknown, infer E> ? E : never

export function combine<T extends readonly Result<unknown, unknown>[]> (
  results: readonly [...T]
): Result<CombineOkTypes<T>, CombineErrTypes<T>> {
  const values: unknown[] = []
  for (const result of results) {
    if (result.isErr()) return err(result.error) as Result<CombineOkTypes<T>, CombineErrTypes<T>>
    values.push(result.value)
  }
  return ok(values) as Result<CombineOkTypes<T>, CombineErrTypes<T>>
}

type CombineAsyncOkTypes<T extends readonly ResultAsync<unknown, unknown>[]> = {
  [K in keyof T]: T[K] extends ResultAsync<infer U, unknown> ? U : never
}

type CombineAsyncErrTypes<T extends readonly ResultAsync<unknown, unknown>[]> =
  T[number] extends ResultAsync<unknown, infer E> ? E : never

export function combineAsync<T extends readonly ResultAsync<unknown, unknown>[]> (
  results: readonly [...T]
): ResultAsync<CombineAsyncOkTypes<T>, CombineAsyncErrTypes<T>> {
  return new ResultAsync(
    Promise.all(results.map(async (r) => r)).then(
      (settled) => combine(settled) as unknown as Result<CombineAsyncOkTypes<T>, CombineAsyncErrTypes<T>>
    )
  )
}
