const sharedRestrictions = [
  {
    selector: 'TSEnumDeclaration',
    message: 'Use const unions with match() instead of enum'
  },
  {
    selector: 'ExportDefaultDeclaration',
    message: 'Use named exports instead of export default'
  }
]

export const strict = [
  {
    rules: {
      'no-restricted-syntax': [
        'error',
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
        ...sharedRestrictions
      ]
    }
  }
]

export const recommended = [
  {
    rules: {
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'ThrowStatement',
          message: 'Prefer err() or fromThrowable() over throw'
        },
        {
          selector: 'TryStatement',
          message: 'Prefer fromThrowable() at the boundary over try/catch'
        },
        {
          selector: 'SwitchStatement',
          message: 'Prefer match() or matchOn() over switch'
        },
        {
          selector: 'CallExpression[callee.property.name="catch"]',
          message: 'Prefer ResultAsync.fromPromise() over .catch()'
        },
        {
          selector: 'CallExpression[callee.property.name="finally"]',
          message: 'Prefer .tap() for cleanup over .finally()'
        },
        ...sharedRestrictions
      ]
    }
  }
]

export default { strict, recommended }
