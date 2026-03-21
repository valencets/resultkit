import { describe, it, expect } from 'vitest'
import { match, matchOn } from '../match.js'

const ErrorCode = { NOT_FOUND: 'NOT_FOUND', INVALID: 'INVALID', TIMEOUT: 'TIMEOUT' } as const
type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode]

type AppError =
  | { readonly code: 'NOT_FOUND'; readonly path: string }
  | { readonly code: 'INVALID'; readonly field: string }
  | { readonly code: 'TIMEOUT'; readonly ms: number }

// Helper to preserve union type (avoids const narrowing)
function ec (code: ErrorCode): ErrorCode { return code }
function ae (error: AppError): AppError { return error }

describe('match()', () => {
  describe('exhaustive matching', () => {
    it('calls the matching handler and returns its value', () => {
      const result = match(ec('NOT_FOUND'), {
        NOT_FOUND: () => 404,
        INVALID: () => 400,
        TIMEOUT: () => 408
      })
      expect(result).toBe(404)
    })

    it('dispatches to the correct handler for each variant', () => {
      const codes: ErrorCode[] = ['NOT_FOUND', 'INVALID', 'TIMEOUT']
      const results = codes.map((code) =>
        match(code, {
          NOT_FOUND: () => 404,
          INVALID: () => 400,
          TIMEOUT: () => 408
        })
      )
      expect(results).toEqual([404, 400, 408])
    })

    it('handler receives the value as argument', () => {
      const result = match(ec('INVALID'), {
        NOT_FOUND: (v) => `got: ${v}`,
        INVALID: (v) => `got: ${v}`,
        TIMEOUT: (v) => `got: ${v}`
      })
      expect(result).toBe('got: INVALID')
    })

    it('handlers can return different types forming a union', () => {
      const result = match(ec('NOT_FOUND'), {
        NOT_FOUND: () => 404,
        INVALID: () => 'bad',
        TIMEOUT: () => true
      })
      expect(result).toBe(404)
    })
  })

  describe('wildcard matching', () => {
    it('falls through to _ when no specific handler matches', () => {
      const result = match(ec('TIMEOUT'), {
        NOT_FOUND: () => 'not found',
        _: () => 'other error'
      })
      expect(result).toBe('other error')
    })

    it('prefers specific handler over _ when key matches', () => {
      const result = match(ec('NOT_FOUND'), {
        NOT_FOUND: () => 'specific',
        _: () => 'wildcard'
      })
      expect(result).toBe('specific')
    })

    it('_ handler receives the value', () => {
      const result = match(ec('INVALID'), {
        _: (v) => `fallback: ${v}`
      })
      expect(result).toBe('fallback: INVALID')
    })
  })
})

describe('matchOn()', () => {
  describe('exhaustive matching', () => {
    it('dispatches to handler using discriminant key', () => {
      const result = matchOn(ae({ code: 'NOT_FOUND', path: '/home' }), 'code', {
        NOT_FOUND: (e) => `missing: ${e.path}`,
        INVALID: (e) => `bad field: ${e.field}`,
        TIMEOUT: (e) => `timed out after ${e.ms}ms`
      })
      expect(result).toBe('missing: /home')
    })

    it('narrows the type so handler receives correct subtype properties', () => {
      const result = matchOn(ae({ code: 'INVALID', field: 'email' }), 'code', {
        NOT_FOUND: (e) => e.path,
        INVALID: (e) => e.field,
        TIMEOUT: (e) => String(e.ms)
      })
      expect(result).toBe('email')
    })

    it('dispatches all variants correctly', () => {
      const errors: AppError[] = [
        { code: 'NOT_FOUND', path: '/x' },
        { code: 'INVALID', field: 'name' },
        { code: 'TIMEOUT', ms: 5000 }
      ]
      const results = errors.map((e) =>
        matchOn(e, 'code', {
          NOT_FOUND: () => 404,
          INVALID: () => 400,
          TIMEOUT: () => 408
        })
      )
      expect(results).toEqual([404, 400, 408])
    })
  })

  describe('wildcard matching', () => {
    it('falls through to _ for unhandled variants', () => {
      const result = matchOn(ae({ code: 'TIMEOUT', ms: 3000 }), 'code', {
        NOT_FOUND: () => 'not found',
        _: () => 'other'
      })
      expect(result).toBe('other')
    })

    it('prefers specific handler over _ when discriminant matches', () => {
      const result = matchOn(ae({ code: 'NOT_FOUND', path: '/y' }), 'code', {
        NOT_FOUND: () => 'specific',
        _: () => 'wildcard'
      })
      expect(result).toBe('specific')
    })

    it('_ handler receives the full object', () => {
      const result = matchOn(ae({ code: 'INVALID', field: 'age' }), 'code', {
        _: (e) => e.code
      })
      expect(result).toBe('INVALID')
    })
  })
})
