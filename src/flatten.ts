import { err } from './result.js'
import type { Result } from './result.js'

/**
 * Flatten a nested Result<Result<T, E2>, E1> into Result<T, E1 | E2>.
 */
export function flatten<T, E1, E2> (result: Result<Result<T, E2>, E1>): Result<T, E1 | E2> {
  if (result.isErr()) return err<T, E1 | E2>(result.error)
  return result.value
}
