import type { Result } from './result.js'

/**
 * Split an array of Results into two arrays: [okValues, errValues].
 * Preserves original order within each group.
 */
export function partition<T, E> (results: readonly Result<T, E>[]): [T[], E[]] {
  const values: T[] = []
  const errors: E[] = []
  for (const result of results) {
    if (result.isOk()) {
      values.push(result.value)
    } else {
      errors.push(result.error)
    }
  }
  return [values, errors]
}
