import { ok, err } from './result.js'
import type { Result } from './result.js'

export type ResultJSON<T, E> =
  | { readonly _tag: 'Ok'; readonly value: T }
  | { readonly _tag: 'Err'; readonly error: E }

export function resultToJSON<T, E> (result: Result<T, E>): ResultJSON<T, E> {
  if (result.isOk()) return { _tag: 'Ok', value: result.value }
  return { _tag: 'Err', error: result.error }
}

export function resultFromJSON<T = unknown, E = unknown> (json: Record<string, unknown>): Result<T, E> {
  if (json._tag === 'Ok') return ok(json.value as T)
  if (json._tag === 'Err') return err(json.error as E)
  throw new Error('Invalid Result JSON: missing or invalid _tag')
}
