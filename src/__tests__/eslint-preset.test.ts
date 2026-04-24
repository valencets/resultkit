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

  it('bans export default', () => {
    expect(selectors).toContain('ExportDefaultDeclaration')
  })

  it('bans .catch() on promises', () => {
    expect(selectors).toContain('CallExpression[callee.property.name="catch"]')
  })

  it('bans .finally() on promises', () => {
    expect(selectors).toContain('CallExpression[callee.property.name="finally"]')
  })

  it('recommended config uses warn severity', () => {
    const recRules = preset.recommended[0].rules['no-restricted-syntax']
    expect(recRules[0]).toBe('warn')
  })
})
