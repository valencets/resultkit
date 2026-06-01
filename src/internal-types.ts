/**
 * Internal types for representing values that can cross boundaries
 * (thrown values, serialized data, etc.).
 *
 * `Value` is intentionally a "safe" / commonly serializable subset (used for
 * error-position inference tricks in combine* and for `Caught`).
 *
 * In practice, arbitrary values (including functions, class instances, etc.)
 * can still be thrown or appear inside `catch` clauses. Boundary functions
 * (`fromThrowable*`, `fromPromise`, `parseResultJSON`) use `as Caught` casts
 * because the static type cannot perfectly model "anything throwable".
 *
 * If you need to handle truly exotic errors, prefer `unknown` at your API
 * boundaries and narrow inside your errorFn.
 */
export type Value = object | string | number | boolean | symbol | bigint | null | undefined
export type FnArgs = readonly Value[]
export type Caught = Value
