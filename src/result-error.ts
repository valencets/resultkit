export class ResultError<Code extends string = string> extends Error {
  readonly code: Code
  readonly context?: unknown

  constructor (code: Code, message: string, context?: unknown) {
    super(message)
    this.name = 'ResultError'
    this.code = code
    this.context = context
  }
}

export function isResultError (value: unknown): value is ResultError<string> {
  return value instanceof ResultError
}
