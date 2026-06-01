import type { Value } from './internal-types.js'

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

export function isResultError (value: Value): value is ResultError<string> {
  return value instanceof ResultError
}
