import { ok, err } from './result.js'
import type { Result } from './result.js'
import type { Value } from './internal-types.js'

export type ResultJSON<T, E> =
  | { readonly _tag: 'Ok'; readonly value: T }
  | { readonly _tag: 'Err'; readonly error: E }

/**
 * Error returned by `parseResultJSON` when the input is not valid Result JSON.
 */
export type ResultJSONParseError = {
  readonly code: 'INVALID_RESULT_JSON'
  readonly message: string
  readonly input: Value
}

export function resultToJSON<T, E> (result: Result<T, E>): ResultJSON<T, E> {
  if (result.isOk()) return { _tag: 'Ok', value: result.value }
  return { _tag: 'Err', error: result.error }
}

/**
 * Safely parse a value that may be Result JSON.
 *
 * This is the untrusted parser — it is strict:
 * - The `value` / `error` field must exist and not be null or undefined.
 * Returns a typed `ResultJSONParseError` instead of throwing.
 */
export function parseResultJSON<T = Value, E = Value> (
  input: Value
): Result<Result<T, E>, ResultJSONParseError> {
  if (!isRecord(input)) return invalidResultJSON(input)

  if (input._tag === 'Ok' && 'value' in input && input.value != null) {
    return ok(ok<T, E>(input.value as T))
  }
  if (input._tag === 'Err' && 'error' in input && input.error != null) {
    return ok(err<T, E>(input.error as E))
  }

  return invalidResultJSON(input)
}

/**
 * Parse Result JSON, throwing on invalid input.
 * Prefer `parseResultJSON` at untrusted boundaries.
 */
export function resultFromJSON<T = Value, E = Value> (input: Value): Result<T, E> {
  const parsed = parseResultJSON<T, E>(input)
  if (parsed.isOk()) return parsed.value

  throw new Error(parsed.error.message, { cause: parsed.error })
}

function isRecord (value: Value): value is Record<string, Value> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function invalidResultJSON (input: Value): Result<never, ResultJSONParseError> {
  return err({
    code: 'INVALID_RESULT_JSON',
    message:
      "Invalid Result JSON: expected {_tag: 'Ok', value} or {_tag: 'Err', error} " +
      'where value/error must be present and not null/undefined',
    input,
  })
}
