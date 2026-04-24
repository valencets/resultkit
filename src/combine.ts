import { ok, err } from './result.js'
import type { Result } from './result.js'
import { ResultAsync } from './result-async.js'

export function combine<T, E> (results: readonly Result<T, E>[]): Result<T[], E> {
  const values: T[] = []
  for (const result of results) {
    if (result.isErr()) return err(result.error)
    values.push(result.value)
  }
  return ok(values)
}

export function combineAsync<T, E> (results: readonly ResultAsync<T, E>[]): ResultAsync<T[], E> {
  return new ResultAsync(
    Promise.all(results.map(async (r) => r)).then((settled) => combine(settled))
  )
}
