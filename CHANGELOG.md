# Changelog

## 0.3.0 — 2026-04-24

### Breaking Changes

- **`fromThrowable` and `fromThrowableAsync` now require `errorFn`.** No more `unknown` error types by default. This enforces typed errors at every boundary.

### New Features

- **Object-style `match({ ok, err })`** overload on `Ok`, `Err`, and `ResultAsync`.
- **`tap(fn)` / `tapErr(fn)`** on `Ok`, `Err`, and `ResultAsync` for side-effect inspection without transforming.
- **`combine(results)`** merges `Result[]` into `Result<T[], E>` with tuple type inference and error union.
- **`combineAsync(results)`** — async variant of `combine`.
- **`fromNullable(value, error)`** converts `T | null | undefined` to `Result<T, E>`.
- **`fromThrowableAsync(fn, errorFn)`** wraps async throwing functions into `ResultAsync`.
- **`unwrap()` / `unwrapErr()`** on `ResultAsync` for API parity with sync Result.
- **Eslint preset** shipped as `@valencets/resultkit/eslint` with `strict` and `recommended` configs.

### Bug Fixes

- **`match()` / `matchOn()`** now throw a descriptive error instead of crashing on missing handler at runtime.
- **`ResultAsync` callbacks** (`map`, `mapErr`, `andThen`, `orElse`) now catch thrown errors instead of creating unhandled rejections.
- **`unwrap()` on Err** now includes the error value in the message and as `Error.cause`.
- **`unwrapErr()` on Ok** now includes the value as `Error.cause`.

### Performance

- `Ok.mapErr`, `Ok.orElse`, `Err.map`, `Err.andThen` return `this` instead of allocating new instances.

## 0.2.0

- Add `match()` and `matchOn()` for exhaustive discriminated union matching.

## 0.1.0

- Initial release.
