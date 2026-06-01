import { ok, err } from './result.js'
import type { Result } from './result.js'
import { ResultAsync, __createResultAsync } from './result-async.js'
import type { Value } from './internal-types.js'

type CombineOkTypes<T extends readonly Result<unknown, Value>[]> = {
  [K in keyof T]: T[K] extends Result<infer U, Value> ? U : never
}

type CombineErrTypes<T extends readonly Result<unknown, Value>[]> =
  T[number] extends Result<Value, infer E> ? E : never

/**
 * Combines an array of Results into a single Result containing an array of successes,
 * or the first error encountered.
 */
export function combine<T extends readonly Result<unknown, Value>[]> (
  results: readonly [...T]
): Result<CombineOkTypes<T>, CombineErrTypes<T>> {
  const values: Value[] = []
  for (const result of results) {
    if (result.isErr()) return err(result.error) as Result<CombineOkTypes<T>, CombineErrTypes<T>>
    // The `as Value` cast is required for the Value[] widening trick that
    // enables good error-position inference in the Combine*Types helpers.
    // See internal-types.ts for rationale.
    values.push(result.value as Value)
  }
  return ok(values) as Result<CombineOkTypes<T>, CombineErrTypes<T>>
}

type CombineAsyncOkTypes<T extends readonly ResultAsync<unknown, Value>[]> = {
  [K in keyof T]: T[K] extends ResultAsync<infer U, Value> ? U : never
}

type CombineAsyncErrTypes<T extends readonly ResultAsync<unknown, Value>[]> =
  T[number] extends ResultAsync<Value, infer E> ? E : never

/**
 * Async version of `combine`.
 */
export function combineAsync<T extends readonly ResultAsync<unknown, Value>[]> (
  results: readonly [...T]
): ResultAsync<CombineAsyncOkTypes<T>, CombineAsyncErrTypes<T>> {
  // Leverage that ResultAsync implements PromiseLike<Result<...>> so Promise.all
  // directly yields the settled Results without an extra async wrapper layer.
  return __createResultAsync(
    Promise.all(results).then(
      (settled) => combine(settled) as unknown as Result<CombineAsyncOkTypes<T>, CombineAsyncErrTypes<T>>
    )
  )
}
