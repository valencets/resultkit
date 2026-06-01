import type { Value } from './internal-types.js'

/**
 * A structured error with a `code` and optional context.
 * Intended for use with `matchOn` on the `code` field.
 *
 * The `context` is typed as `Value` (anything that can be safely serialized or caught).
 */
export class ResultError<Code extends string = string, Context extends Value = Value> extends Error {
  readonly code: Code
  readonly context?: Context | undefined

  constructor (code: Code, message: string, context?: Context) {
    super(message)
    this.name = 'ResultError'
    this.code = code
    this.context = context
  }
}

/**
 * Type guard for `ResultError`.
 * Accepts any `Value` (things that can be thrown or serialized).
 */
export function isResultError (value: Value): value is ResultError<string> {
  return value instanceof ResultError
}
