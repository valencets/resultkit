import { describe, it, expectTypeOf } from 'vitest'
import { match, matchOn } from '../match.js'

const ErrorCode = { NOT_FOUND: 'NOT_FOUND', INVALID: 'INVALID' } as const
type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode]

type AppError =
  | { readonly code: 'NOT_FOUND'; readonly path: string }
  | { readonly code: 'INVALID'; readonly field: string }

// Helpers to preserve union type (avoids const narrowing)
function ec (code: ErrorCode): ErrorCode { return code }
function ae (error: AppError): AppError { return error }

describe('match() type inference', () => {
  it('exhaustive: return type is union of handler return types', () => {
    const result = match(ec('NOT_FOUND'), {
      NOT_FOUND: () => 404 as const,
      INVALID: () => 400 as const
    })
    expectTypeOf(result).toEqualTypeOf<404 | 400>()
  })

  it('exhaustive: return type collapses when all handlers return same type', () => {
    const result = match(ec('NOT_FOUND'), {
      NOT_FOUND: () => 404,
      INVALID: () => 400
    })
    expectTypeOf(result).toEqualTypeOf<number>()
  })

  it('wildcard: return type matches R from handlers', () => {
    const result = match(ec('NOT_FOUND'), {
      NOT_FOUND: () => 'specific',
      _: () => 'other'
    })
    expectTypeOf(result).toEqualTypeOf<string>()
  })

  it('exhaustive: handler receives the literal string value', () => {
    match(ec('NOT_FOUND'), {
      NOT_FOUND: (v) => {
        expectTypeOf(v).toEqualTypeOf<'NOT_FOUND'>()
        return v
      },
      INVALID: (v) => {
        expectTypeOf(v).toEqualTypeOf<'INVALID'>()
        return v
      }
    })
  })
})

describe('matchOn() type inference', () => {
  it('exhaustive: return type is union of handler return types', () => {
    const result = matchOn(ae({ code: 'NOT_FOUND', path: '/x' }), 'code', {
      NOT_FOUND: () => 404 as const,
      INVALID: () => 400 as const
    })
    expectTypeOf(result).toEqualTypeOf<404 | 400>()
  })

  it('exhaustive: handler receives narrowed type', () => {
    matchOn(ae({ code: 'NOT_FOUND', path: '/x' }), 'code', {
      NOT_FOUND: (e) => {
        expectTypeOf(e).toEqualTypeOf<{ readonly code: 'NOT_FOUND'; readonly path: string }>()
        return e.path
      },
      INVALID: (e) => {
        expectTypeOf(e).toEqualTypeOf<{ readonly code: 'INVALID'; readonly field: string }>()
        return e.field
      }
    })
  })

  it('wildcard: return type matches R', () => {
    const result = matchOn(ae({ code: 'NOT_FOUND', path: '/x' }), 'code', {
      NOT_FOUND: () => 'found',
      _: () => 'other'
    })
    expectTypeOf(result).toEqualTypeOf<string>()
  })

  it('wildcard: _ handler receives the full union object', () => {
    matchOn(ae({ code: 'NOT_FOUND', path: '/x' }), 'code', {
      _: (e) => {
        expectTypeOf(e).toEqualTypeOf<AppError>()
        return e.code
      }
    })
  })
})
