// Core
export { Ok, Err, ok, err } from './result.js'
export type { Result } from './result.js'
export { ResultAsync, okAsync, errAsync } from './result-async.js'

// Boundary converters
export { fromThrowable } from './from-throwable.js'
export { fromThrowableAsync } from './from-throwable-async.js'
export { fromNullable } from './from-nullable.js'

// Combinators
export { combine, combineAsync } from './combine.js'
export { flatten } from './flatten.js'
export { partition } from './partition.js'

// Pattern matching
export { match, matchOn } from './match.js'
export type {
  MatchHandlers,
  MatchHandlersPartial,
  MatchOnHandlers,
  MatchOnHandlersPartial
} from './match-types.js'

// Branded errors
export { ResultError, isResultError } from './result-error.js'

// Serialization
export { resultToJSON, resultFromJSON } from './serialization.js'
export type { ResultJSON } from './serialization.js'

// Type helpers
export type { InferOkType, InferErrType } from './types.js'
