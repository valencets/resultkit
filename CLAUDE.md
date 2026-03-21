# CLAUDE.md

## Commands

```bash
pnpm install            # install deps
pnpm build              # tsc (build only, excludes tests)
pnpm test               # vitest run
pnpm test:watch         # vitest (watch mode)
pnpm test:coverage      # vitest with coverage
pnpm lint               # neostandard
pnpm validate           # typecheck + lint
```

## Architecture

Zero-dependency Result monad library. Two types:

- `Result<T, E> = Ok<T, E> | Err<T, E>` — synchronous
- `ResultAsync<T, E>` — wraps `Promise<Result<T, E>>`, implements `PromiseLike`

Source files in `src/`:
- `result.ts` — Ok class, Err class, Result type, ok(), err()
- `result-async.ts` — ResultAsync class, okAsync(), errAsync()
- `from-throwable.ts` — fromThrowable() boundary wrapper (only try/catch)
- `types.ts` — InferOkType, InferErrType helpers
- `index.ts` — Named re-exports

## Banned Patterns

- `throw` / `try/catch` — only in `from-throwable.ts` and `result.ts` (unwrap/unwrapErr)
- `enum` — use const unions
- `switch` — use dictionary maps
- `export default` — named exports only (except config files)
- `any` / `unknown` casts — proper type narrowing

## Testing

TDD: RED → GREEN → REFACTOR. Tests in `src/__tests__/`. Vitest with node environment.
