import type { Result } from './result.js'

export function flatten<T, E1, E2> (result: Result<Result<T, E2>, E1>): Result<T, E1 | E2> {
  if (result.isErr()) return result as unknown as Result<T, E1 | E2>
  return result.value
}
