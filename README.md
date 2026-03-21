# resultkit

Opinionated, minimal Result monad for TypeScript. Railway-oriented error handling with `Ok`, `Err`, `map`, `andThen`, `match` — and nothing else you don't need.

## Why resultkit?

TypeScript's `try/catch` is broken by design:

- **Caught errors are `unknown`** — no type safety at the boundary
- **Errors are invisible in signatures** — callers don't know a function can fail
- **Control flow jumps** — thrown errors skip your logic and land wherever they want

Result monads fix this by encoding success and failure **in the type system**. Every fallible function returns `Result<T, E>` — the caller sees both paths and handles them explicitly.

### Why not neverthrow?

[neverthrow](https://github.com/supermacro/neverthrow) is good. resultkit exists because:

- **Smaller API surface.** neverthrow ships `safeTry`, generators, `andTee`, `orTee`, `andThrough`, `combine`, `combineWithAllErrors`, iterator protocol, and more. resultkit ships only what you actually use.
- **Zero unsafe casts.** No `as unknown as` anywhere in the implementation. Every type transformation creates a new instance with correct types.
- **Zero dependencies.** Nothing in your `node_modules` you didn't ask for.
- **Extracted from production.** Every method in resultkit exists because it was needed in a real codebase. Nothing speculative, nothing "just in case."

### What's included

| Method | Description |
|--------|-------------|
| `ok(value)` | Create a success result |
| `err(error)` | Create a failure result |
| `.isOk()` / `.isErr()` | Type-narrowing guards |
| `.map(fn)` | Transform the success value |
| `.mapErr(fn)` | Transform the error value |
| `.andThen(fn)` | Chain into another Result (flatMap) |
| `.orElse(fn)` | Recover from an error |
| `.match(okFn, errFn)` | Exhaustive pattern match |
| `.unwrapOr(default)` | Extract value or use default |
| `.unwrap()` / `.unwrapErr()` | Unsafe extraction (tests only) |
| `.toAsync()` | Convert to ResultAsync |
| `fromThrowable(fn, errorFn?)` | Wrap throwing functions at the boundary |

Plus `ResultAsync<T, E>` with the same API for async operations, and `okAsync`, `errAsync`, `ResultAsync.fromPromise`, `ResultAsync.fromSafePromise` constructors.

### What's deliberately excluded

These features exist in other Result libraries but are not included here because they add complexity without demonstrated need:

- `safeTry` / generator protocol
- `andTee` / `orTee` / `andThrough` (side-effect methods)
- `combine` / `combineWithAllErrors`
- `asyncMap` / `asyncAndThen`
- Iterator protocol

If you need them, use neverthrow. resultkit is for teams that want less, not more.

## Install

```bash
npm install @valencets/resultkit
```

## Quick Start

```typescript
import { ok, err, fromThrowable } from '@valencets/resultkit'
import type { Result } from '@valencets/resultkit'

// Define your error type
interface AppError {
  readonly code: string
  readonly message: string
}

// Functions return Result instead of throwing
function divide (a: number, b: number): Result<number, AppError> {
  if (b === 0) {
    return err({ code: 'DIVISION_BY_ZERO', message: 'Cannot divide by zero' })
  }
  return ok(a / b)
}

// Chain operations — errors short-circuit automatically
const result = divide(100, 5)
  .andThen((n) => divide(n, 2))
  .map((n) => n.toFixed(2))

// Handle both paths explicitly
result.match(
  (value) => console.log(`Result: ${value}`),
  (error) => console.error(`Error: ${error.message}`)
)
```

## Usage

### Sync Results

```typescript
import { ok, err } from '@valencets/resultkit'
import type { Result } from '@valencets/resultkit'

// Construction
const success = ok(42)          // Ok<number, never>
const failure = err('oops')     // Err<never, string>

// Type narrowing
function handle (result: Result<number, string>) {
  if (result.isOk()) {
    console.log(result.value)   // TypeScript knows .value exists
  }
  if (result.isErr()) {
    console.log(result.error)   // TypeScript knows .error exists
  }
}

// Transforms
ok(5)
  .map((n) => n * 2)           // Ok(10)
  .andThen((n) =>
    n > 100 ? err('too big') : ok(n)
  )                             // Ok(10)
  .mapErr((e) => e.toUpperCase()) // passes through Ok unchanged
  .match(
    (value) => `got ${value}`,
    (error) => `failed: ${error}`
  )                             // 'got 10'

// Recovery
err('bad')
  .orElse(() => ok(0))         // Ok(0) — recovered from error

// Default values
err('bad').unwrapOr(42)        // 42
ok(5).unwrapOr(42)             // 5
```

### Async Results

```typescript
import { okAsync, errAsync, ResultAsync } from '@valencets/resultkit'

// Wrap promises that might reject
const fetchUser = (id: number) =>
  ResultAsync.fromPromise(
    fetch(`/api/users/${id}`).then((r) => r.json()),
    (e) => ({ code: 'FETCH_FAILED', message: String(e) })
  )

// Chain async operations
const userName = await fetchUser(1)
  .map((user) => user.name)
  .andThen((name) =>
    name.length > 0 ? okAsync(name) : errAsync({ code: 'INVALID', message: 'empty name' })
  )
  .match(
    (name) => name,
    (error) => `Unknown (${error.code})`
  )

// Wrap safe promises (guaranteed not to reject)
const config = ResultAsync.fromSafePromise(
  fs.readFile('./config.json', 'utf-8')
)

// Convert sync to async
const asyncResult = ok(5).toAsync()  // ResultAsync<number, never>
```

### Wrapping Throwing Code

```typescript
import { fromThrowable } from '@valencets/resultkit'

// Wrap any function that might throw
const safeJsonParse = fromThrowable(
  (s: string) => JSON.parse(s),
  (e) => ({ code: 'PARSE_FAILED', message: e instanceof Error ? e.message : 'unknown' })
)

safeJsonParse('{"valid": true}')  // Ok({ valid: true })
safeJsonParse('not json')         // Err({ code: 'PARSE_FAILED', message: '...' })

// Without errorFn — error type is unknown
const safeParse = fromThrowable(JSON.parse)
safeParse('bad')  // Result<any, unknown>
```

### Railway-Oriented Programming

Chain operations and let errors propagate automatically:

```typescript
import { ok, err, ResultAsync } from '@valencets/resultkit'
import type { Result } from '@valencets/resultkit'

interface DbError { readonly code: string; readonly message: string }
interface User { readonly id: number; readonly name: string; readonly email: string }

function validateEmail (email: string): Result<string, DbError> {
  return email.includes('@')
    ? ok(email)
    : err({ code: 'INVALID_EMAIL', message: 'Email must contain @' })
}

function findUser (email: string): ResultAsync<User, DbError> {
  return ResultAsync.fromPromise(
    db.query('SELECT * FROM users WHERE email = $1', [email]),
    (e) => ({ code: 'QUERY_FAILED', message: String(e) })
  )
}

function sendWelcome (user: User): ResultAsync<void, DbError> {
  return ResultAsync.fromPromise(
    mailer.send(user.email, 'Welcome!'),
    (e) => ({ code: 'MAIL_FAILED', message: String(e) })
  )
}

// Each step either succeeds and continues, or fails and short-circuits
const result = validateEmail(input)
  .toAsync()
  .andThen((email) => findUser(email))
  .andThen((user) => sendWelcome(user))

await result.match(
  () => console.log('Welcome email sent'),
  (error) => console.error(`Failed at ${error.code}: ${error.message}`)
)
```

### Type Inference Helpers

```typescript
import type { InferOkType, InferErrType, Result } from '@valencets/resultkit'

type MyResult = Result<number, string>

type T = InferOkType<MyResult>   // number
type E = InferErrType<MyResult>  // string
```

## API Reference

### Constructors

| Function | Signature | Description |
|----------|-----------|-------------|
| `ok` | `ok<T>(value: T): Ok<T, never>` | Create a success result |
| `err` | `err<E>(error: E): Err<never, E>` | Create a failure result |
| `okAsync` | `okAsync<T>(value: T): ResultAsync<T, never>` | Create an async success |
| `errAsync` | `errAsync<E>(error: E): ResultAsync<never, E>` | Create an async failure |
| `fromThrowable` | `fromThrowable(fn, errorFn?): (...args) => Result` | Wrap a throwing function |
| `ResultAsync.fromPromise` | `fromPromise(promise, errorFn): ResultAsync` | Wrap a potentially-rejecting promise |
| `ResultAsync.fromSafePromise` | `fromSafePromise(promise): ResultAsync` | Wrap a promise that never rejects |

### Instance Methods

All methods are available on both `Result` and `ResultAsync` (async versions return `Promise` from terminal methods).

| Method | On Ok | On Err |
|--------|-------|--------|
| `.isOk()` | `true` (narrows type) | `false` |
| `.isErr()` | `false` | `true` (narrows type) |
| `.map(fn)` | Applies `fn` to value | Passes through unchanged |
| `.mapErr(fn)` | Passes through unchanged | Applies `fn` to error |
| `.andThen(fn)` | Applies `fn` (must return Result) | Passes through unchanged |
| `.orElse(fn)` | Passes through unchanged | Applies `fn` (must return Result) |
| `.match(okFn, errFn)` | Calls `okFn(value)` | Calls `errFn(error)` |
| `.unwrapOr(default)` | Returns value | Returns default |
| `.unwrap()` | Returns value | **Throws** |
| `.unwrapErr()` | **Throws** | Returns error |
| `.toAsync()` | Converts to `ResultAsync` | Converts to `ResultAsync` |

## Design Principles

1. **Explicit over implicit.** Every error path is visible in the type signature.
2. **Minimal API.** If we haven't needed it in production, it's not here.
3. **Zero dependencies.** Your supply chain is your attack surface.
4. **Type safety without casts.** No `as unknown as` anywhere in the implementation.
5. **Boundary isolation.** `try/catch` exists in exactly one place: `fromThrowable`.

## Contracts

**`.map()` and `.mapErr()` mappers must not throw.** These methods are for infallible transforms. If a mapper throws (sync) or rejects (async), the exception propagates as an unhandled rejection rather than being captured as an `Err`. Use `.andThen()` with `fromThrowable` for fallible operations.

**`fromThrowable` `errorFn` must not throw.** The `errorFn` mapper runs inside the `catch` block. If `errorFn` itself throws, that exception escapes the boundary. Keep `errorFn` pure — simple object construction like `(e) => ({ code: 'FAILED', message: String(e) })`.

**`ResultAsync.fromSafePromise` callers guarantee the promise never rejects.** If the promise rejects, the rejection propagates as an unhandled rejection rather than being captured as an `Err`. Use `ResultAsync.fromPromise` with an `errorFn` for promises that might reject.

## Requirements

- Node.js >= 22
- TypeScript >= 5.9 (for best type inference)
- ESM only (`"type": "module"`)

## License

MIT
