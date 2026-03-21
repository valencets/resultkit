/**
 * Handlers map for exhaustive string-union matching.
 * Every variant V must have a handler; return types form a union R.
 */
export type MatchHandlers<V extends string, R> = {
  readonly [K in V]: (value: K) => R
}

/**
 * Handlers map for partial string-union matching with wildcard.
 * At least _ must be present; specific handlers are optional.
 */
export type MatchHandlersPartial<V extends string, R> = {
  readonly [K in V]?: (value: K) => R
} & {
  readonly _: (value: V) => R
}

/**
 * Handlers map for exhaustive tagged-object matching.
 * T is the full union, K is the discriminant key.
 * Each handler receives the narrowed subtype.
 */
export type MatchOnHandlers<T, K extends keyof T, R> = {
  readonly [D in T[K] & string]: (value: Extract<T, Record<K, D>>) => R
}

/**
 * Handlers map for partial tagged-object matching with wildcard.
 */
export type MatchOnHandlersPartial<T, K extends keyof T, R> = {
  readonly [D in T[K] & string]?: (value: Extract<T, Record<K, D>>) => R
} & {
  readonly _: (value: T) => R
}
