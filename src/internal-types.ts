/**
 * Internal types for representing values that can cross boundaries
 * (thrown values, serialized data, etc.).
 */
export type Value = object | string | number | boolean | symbol | bigint | null | undefined
export type FnArgs = readonly Value[]
export type Caught = Value
