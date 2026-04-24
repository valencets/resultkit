import { describe, it, expect } from 'vitest'

// @ts-expect-error — JS config file, no declaration
import preset from '../../eslint-preset.js'

describe('eslint-preset', () => {
  const strictRules = preset.strict[0].rules['no-restricted-syntax']
  const selectors = strictRules.slice(1).map((r: { selector: string }) => r.selector)

  it('bans throw', () => {
    expect(selectors).toContain('ThrowStatement')
  })

  it('bans try/catch', () => {
    expect(selectors).toContain('TryStatement')
  })

  it('bans switch', () => {
    expect(selectors).toContain('SwitchStatement')
  })

  it('bans enum', () => {
    expect(selectors).toContain('TSEnumDeclaration')
  })

  it('bans .catch() on promises', () => {
    expect(selectors).toContain('CallExpression[callee.property.name="catch"]')
  })

  it('bans .finally() on promises', () => {
    expect(selectors).toContain('CallExpression[callee.property.name="finally"]')
  })

  it('warns on .unwrap()', () => {
    expect(selectors).toContain('CallExpression[callee.property.name="unwrap"]')
  })

  it('warns on .unwrapErr()', () => {
    expect(selectors).toContain('CallExpression[callee.property.name="unwrapErr"]')
  })

  it('does NOT ban export default in strict', () => {
    expect(selectors).not.toContain('ExportDefaultDeclaration')
  })

  it('opinionated includes export default ban', () => {
    const opRules = preset.opinionated[0].rules['no-restricted-syntax']
    const opSelectors = opRules.slice(1).map((r: { selector: string }) => r.selector)
    expect(opSelectors).toContain('ExportDefaultDeclaration')
  })

  it('recommended config uses warn severity', () => {
    const recRules = preset.recommended[0].rules['no-restricted-syntax']
    expect(recRules[0]).toBe('warn')
  })
})
