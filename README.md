# resultkit

Type-safe errors with pattern matching and zero escape hatches.

## What is this?

A Result monad for TypeScript that enforces **strict typed errors**, ships **pattern matching as a first-class paradigm**, and includes an **eslint preset** that makes railway-oriented programming a project-wide discipline — not just a suggestion.

## Why not neverthrow?

neverthrow is a good library. resultkit exists because neverthrow is permissive where we think strictness is needed:

| | neverthrow | resultkit |
|--|-----------|-----------|
| Error types | `unknown` by default | `errorFn` required — you type every error |
| Pattern matching | `.match()` method only | Standalone `match()`, `matchOn()` with exhaustive discriminated unions |
| Unhandled Results | Silent | Enforced by team convention |
| `throw` / `try/catch` | Your problem | eslint preset bans them, points to `fromThrowable` |
| `switch` statements | Your problem | eslint preset bans them, points to `match()` |
| `.catch()` / `.finally()` | Your problem | eslint preset bans them, points to `ResultAsync.fromPromise` and `.tap()` |

resultkit is for teams that want **guardrails**, not just types.

## Install

```bash
npm install @valencets/resultkit
```

## Quick Start

```typescript
import { ok, err, fromThrowable, match } from '@valencets/resultkit'
import type { Result } from '@valencets/resultkit'

// Every error is typed — no unknown allowed
interface AppError {
  readonly code: 'DIVISION_BY_ZERO' | 'NEGATIVE'
  readonly message: string
}

function divide (a: number, b: number): Result<number, AppError> {
  if (b === 0) return err({ code: 'DIVISION_BY_ZERO', message: 'Cannot divide by zero' })
  if (b < 0) return err({ code: 'NEGATIVE', message: 'Negative divisor' })
  return ok(a / b)
}

// Pattern match on the error code — exhaustive, type-narrowing
const result = divide(10, 0)

result.match({
  ok: (value) => console.log(`Result: ${value}`),
  err: (error) => match(error.code, {
    DIVISION_BY_ZERO: () => console.error('Cannot divide by zero'),
    NEGATIVE: () => console.error('Negative divisor')
  })
})
```

## Core API

### Constructors

| Function | Description |
|----------|-------------|
| `ok(value)` | Create a success Result |
| `err(error)` | Create a failure Result |
| `okAsync(value)` | Create an async success |
| `errAsync(error)` | Create an async failure |
| `fromThrowable(fn, errorFn)` | Wrap a throwing function — `errorFn` required |
| `fromThrowableAsync(fn, errorFn)` | Wrap an async throwing function — `errorFn` required |
| `fromNullable(value, error)` | Convert `T \| null \| undefined` to `Result<T, E>` |
| `ResultAsync.fromPromise(promise, errorFn)` | Wrap a rejectable promise |
| `ResultAsync.fromSafePromise(promise)` | Wrap a promise guaranteed not to reject |

### Methods

All methods are available on `Ok`, `Err`, and `ResultAsync`.

| Method | On Ok | On Err |
|--------|-------|--------|
| `.isOk()` | `true` (narrows type) | `false` |
| `.isErr()` | `false` | `true` (narrows type) |
| `.map(fn)` | Applies `fn` to value | Passes through |
| `.mapErr(fn)` | Passes through | Applies `fn` to error |
| `.andThen(fn)` | Applies `fn` (returns Result) | Passes through |
| `.orElse(fn)` | Passes through | Applies `fn` (returns Result) |
| `.match(okFn, errFn)` | Calls `okFn(value)` | Calls `errFn(error)` |
| `.match({ ok, err })` | Calls `ok(value)` | Calls `err(error)` |
| `.tap(fn)` | Calls `fn(value)`, returns self | Passes through |
| `.tapErr(fn)` | Passes through | Calls `fn(error)`, returns self |
| `.unwrapOr(default)` | Returns value | Returns default |
| `.unwrap()` | Returns value | **Throws** (lint-flagged) |
| `.unwrapErr()` | **Throws** (lint-flagged) | Returns error |
| `.toAsync()` | Converts to `ResultAsync` | Converts to `ResultAsync` |

### Combinators

| Function | Description |
|----------|-------------|
| `combine(results)` | `Result[]` → `Result<[T1, T2, ...], E1 \| E2 \| ...>` — tuple-aware, first Err wins |
| `combineAsync(results)` | Async variant of `combine` |
| `partition(results)` | `Result<T, E>[]` → `[T[], E[]]` — split into ok/err arrays |
| `flatten(result)` | `Result<Result<T, E2>, E1>` → `Result<T, E1 \| E2>` |

### Pattern Matching

```typescript
import { match, matchOn } from '@valencets/resultkit'

type Status = 'active' | 'inactive' | 'banned'

// Exhaustive — compiler errors if you miss a variant
match(status, {
  active: () => 'Welcome',
  inactive: () => 'Please verify',
  banned: () => 'Access denied'
})

// Wildcard — handle some, catch-all the rest
match(status, {
  banned: () => 'Access denied',
  _: () => 'OK'
})

// Discriminated unions — type narrows in each handler
type AppError =
  | { code: 'NOT_FOUND'; path: string }
  | { code: 'TIMEOUT'; ms: number }

matchOn(error, 'code', {
  NOT_FOUND: (e) => `Missing: ${e.path}`,   // e is { code: 'NOT_FOUND', path: string }
  TIMEOUT: (e) => `Waited ${e.ms}ms`        // e is { code: 'TIMEOUT', ms: number }
})
```

### Serialization

```typescript
import { resultToJSON, resultFromJSON } from '@valencets/resultkit'

const json = resultToJSON(ok(42))     // { _tag: 'Ok', value: 42 }
const wire = JSON.stringify(json)      // send across process boundary
const result = resultFromJSON(JSON.parse(wire))  // back to Result
```

### Branded Errors

```typescript
import { ResultError, isResultError, matchOn, err } from '@valencets/resultkit'

type AppError =
  | ResultError<'NOT_FOUND'>
  | ResultError<'TIMEOUT'>
  | ResultError<'VALIDATION'>

const error = new ResultError('NOT_FOUND', 'User not found', { userId: 123 })

// Works with matchOn — code is the discriminant
matchOn(error, 'code', {
  NOT_FOUND: (e) => `Missing: ${e.message}`,
  TIMEOUT: (e) => `Slow: ${e.message}`,
  VALIDATION: (e) => `Bad input: ${e.message}`
})

// Type guard for unknown → ResultError narrowing
if (isResultError(caught)) {
  console.log(caught.code, caught.context)
}
```

### Type Helpers

```typescript
import type { InferOkType, InferErrType, Result } from '@valencets/resultkit'

type T = InferOkType<Result<number, string>>   // number
type E = InferErrType<Result<number, string>>   // string
```

## The eslint Preset

resultkit ships an eslint preset that enforces railway-oriented programming across your project.

```javascript
// eslint.config.js
import resultkit from '@valencets/resultkit/eslint'

export default [
  ...resultkit.strict,
  // your overrides
]
```

### What it enforces

Three flat-config presets are exported. `strict` (errors) and `recommended` (warnings) share the same core error-handling rules; `opinionated` extends `strict` with stylistic rules that are unrelated to the error-handling thesis.

**Core (strict / recommended):**

| Rule | Rationale |
|------|-----------|
| Ban `throw` | Use `err()` or `fromThrowable()` |
| Ban `try/catch` | Use `fromThrowable()` at the boundary |
| Ban `switch` | Use `match()` or `matchOn()` |
| Ban `.catch()` | Use `ResultAsync.fromPromise()` |
| Ban `.finally()` | Use `.tap()` for cleanup |
| Ban `enum` | Use const unions with `match()` |
| Warn `.unwrap()` / `.unwrapErr()` | Prefer `.match()` or `.unwrapOr()` — override in test files |

**Opinionated (adds):**

| Rule | Rationale |
|------|-----------|
| Ban `export default` | Named exports only |

## Design Principles

1. **Every error is typed.** No `unknown` leaking through your codebase. `errorFn` is required on every boundary function.
2. **Pattern matching is the primary control flow.** `match()` and `matchOn()` replace `switch`, `if/else` chains, and ad-hoc property checks.
3. **The library is a workflow.** The eslint preset makes the discipline enforceable, not optional.
4. **Strict by default.** Permissive escape hatches exist (`unwrap`, `as unknown`) but the tooling flags them.

## Requirements

- Node.js >= 22
- TypeScript >= 5.9
- ESM only (`"type": "module"`)

The Node 22 floor tracks the [Node.js release schedule](https://github.com/nodejs/release#release-schedule): Node 20 reached end-of-life in April 2026, so 22 is the oldest line still receiving security patches. The source itself has no Node 22-specific requirement — it compiles to ES2022 with no `node:` imports — so projects still on 20 can override the `engines` field at their own risk.

## License

MIT
