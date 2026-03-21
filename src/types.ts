import type { Result } from './result.js'
import type { ResultAsync } from './result-async.js'

export type InferOkType<R> = R extends Result<infer T, unknown> ? T
  : R extends ResultAsync<infer T, unknown> ? T
    : never

export type InferErrType<R> = R extends Result<unknown, infer E> ? E
  : R extends ResultAsync<unknown, infer E> ? E
    : never
