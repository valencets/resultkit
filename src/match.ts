// ── match() ──────────────────────────────────────────────────────────────────

// Partial with _ (checked first — if _ present, this matches)
export function match<V extends string, R> (
  value: V,
  handlers: { readonly [K in V]?: (value: K) => R } & { readonly _: (value: V) => R }
): R

// Exhaustive (all keys required, no _)
export function match<
  V extends string,
  H extends { readonly [K in V]: (value: K) => unknown }
> (
  value: V,
  handlers: H
): ReturnType<H[V]>

export function match (value: string, handlers: Record<string, unknown>): unknown {
  const h = handlers as Record<string, ((v: string) => unknown) | undefined>
  const fn = h[value] ?? h['_']
  return fn!(value)
}

// ── matchOn() ─────────────────────────────────────────────────────────────────

// Partial with _ (checked first)
export function matchOn<T extends Record<K, string>, K extends string, R> (
  obj: T,
  discriminant: K,
  handlers: { readonly [D in T[K] & string]?: (value: Extract<T, Record<K, D>>) => R } & { readonly _: (value: T) => R }
): R

// Exhaustive (all discriminant values required)
export function matchOn<
  T extends Record<K, string>,
  K extends string,
  H extends { readonly [D in T[K] & string]: (value: Extract<T, Record<K, D>>) => unknown }
> (
  obj: T,
  discriminant: K,
  handlers: H
): ReturnType<H[T[K] & string]>

export function matchOn (obj: Record<string, unknown>, discriminant: string, handlers: Record<string, unknown>): unknown {
  const key = obj[discriminant] as string
  const h = handlers as Record<string, ((v: Record<string, unknown>) => unknown) | undefined>
  const fn = h[key] ?? h['_']
  return fn!(obj)
}
