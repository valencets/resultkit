import type { Result } from './result.js'

export function partition<T, E> (results: readonly Result<T, E>[]): [T[], E[]] {
  const oks: T[] = []
  const errs: E[] = []
  for (const result of results) {
    if (result.isOk()) oks.push(result.value)
    else errs.push(result.error)
  }
  return [oks, errs]
}
