import type { Result } from './result.js'
import type { ResultAsync } from './result-async.js'

/**
 * Extract the Ok type from a `Result` type.
 */
export type InferOkType<R> = R extends Result<infer T, unknown> ? T
  : R extends ResultAsync<infer T, unknown> ? T
    : never

/**
 * Extract the Err type from a `Result` type.
 */
export type InferErrType<R> = R extends Result<unknown, infer E> ? E
  : R extends ResultAsync<unknown, infer E> ? E
    : never
