import neostandard, { plugins } from 'neostandard'

const tsPlugin = plugins['typescript-eslint'].plugin

export default [
  { ignores: ['**/dist/'] },
  ...neostandard({ ts: true }),
  {
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      '@typescript-eslint/no-redeclare': 'off',
      complexity: ['error', 20],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ThrowStatement',
          message: 'Use Result/ResultAsync instead of throw'
        },
        {
          selector: 'TryStatement',
          message: 'Use Result/ResultAsync instead of try/catch'
        },
        {
          selector: 'TSEnumDeclaration',
          message: 'Use const unions instead of enum'
        },
        {
          selector: 'SwitchStatement',
          message: 'Use dictionary maps instead of switch'
        },
        {
          selector: 'ExportDefaultDeclaration',
          message: 'Use named exports instead of export default'
        }
      ]
    }
  },
  // Config files require export default by convention
  {
    files: ['vitest.config.ts', 'eslint.config.js', 'eslint-preset.js'],
    rules: {
      'no-restricted-syntax': 'off'
    }
  },
  // Test files may use throw/try to test error boundaries
  {
    files: ['**/__tests__/**/*.ts'],
    rules: {
      'no-restricted-syntax': 'off'
    }
  },
  // These files throw intentionally as runtime safety nets
  {
    files: ['src/match.ts', 'src/serialization.ts', 'src/result.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TryStatement',
          message: 'Use Result/ResultAsync instead of try/catch'
        },
        {
          selector: 'TSEnumDeclaration',
          message: 'Use const unions instead of enum'
        },
        {
          selector: 'SwitchStatement',
          message: 'Use dictionary maps instead of switch'
        },
        {
          selector: 'ExportDefaultDeclaration',
          message: 'Use named exports instead of export default'
        }
      ]
    }
  },
  // result-async.ts catches user callback throws to prevent unhandled rejections
  {
    files: ['src/result-async.ts', 'src/from-throwable-async.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ThrowStatement',
          message: 'Use Result/ResultAsync instead of throw'
        },
        {
          selector: 'TSEnumDeclaration',
          message: 'Use const unions instead of enum'
        },
        {
          selector: 'SwitchStatement',
          message: 'Use dictionary maps instead of switch'
        },
        {
          selector: 'ExportDefaultDeclaration',
          message: 'Use named exports instead of export default'
        }
      ]
    }
  },
  // fromThrowable is the allowed try/catch boundary
  {
    files: ['src/from-throwable.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ThrowStatement',
          message: 'Use Result/ResultAsync instead of throw'
        },
        {
          selector: 'TSEnumDeclaration',
          message: 'Use const unions instead of enum'
        },
        {
          selector: 'SwitchStatement',
          message: 'Use dictionary maps instead of switch'
        },
        {
          selector: 'ExportDefaultDeclaration',
          message: 'Use named exports instead of export default'
        }
      ]
    }
  }
]
