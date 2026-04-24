const coreRules = [
  {
    selector: 'ThrowStatement',
    message: 'Use err() or fromThrowable() instead of throw'
  },
  {
    selector: 'TryStatement',
    message: 'Use fromThrowable() at the boundary instead of try/catch'
  },
  {
    selector: 'SwitchStatement',
    message: 'Use match() or matchOn() instead of switch'
  },
  {
    selector: 'CallExpression[callee.property.name="catch"]',
    message: 'Use ResultAsync.fromPromise() instead of .catch()'
  },
  {
    selector: 'CallExpression[callee.property.name="finally"]',
    message: 'Use .tap() for cleanup instead of .finally()'
  },
  {
    selector: 'TSEnumDeclaration',
    message: 'Use const unions with match() instead of enum'
  },
  {
    selector: 'CallExpression[callee.property.name="unwrap"]',
    message: 'Avoid .unwrap() outside tests — use .match() or .unwrapOr() to handle both paths'
  },
  {
    selector: 'CallExpression[callee.property.name="unwrapErr"]',
    message: 'Avoid .unwrapErr() outside tests — use .match() to handle both paths'
  }
]

const styleRules = [
  {
    selector: 'ExportDefaultDeclaration',
    message: 'Use named exports instead of export default'
  }
]

export const strict = [
  {
    rules: {
      'no-restricted-syntax': ['error', ...coreRules]
    }
  }
]

export const recommended = [
  {
    rules: {
      'no-restricted-syntax': [
        'warn',
        ...coreRules.map(r => ({ ...r, message: r.message.replace(/^Use |^Avoid /, 'Prefer ') }))
      ]
    }
  }
]

export const opinionated = [
  {
    rules: {
      'no-restricted-syntax': ['error', ...coreRules, ...styleRules]
    }
  }
]

export default { strict, recommended, opinionated }
