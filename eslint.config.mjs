import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import node from 'eslint-plugin-node';
import security from 'eslint-plugin-security';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import promise from 'eslint-plugin-promise';
import unicorn from 'eslint-plugin-unicorn';
import functional from 'eslint-plugin-functional';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      'eslint.config.mjs',
      '.lintstagedrc.mjs',
      'commitlint.config.mjs',
      'vite.config.ts',
      '.github/**/*',
      '.husky/**/*',
      '.vscode/**/*',
      'config/**/*',
      'coverage',
      'dist',
      'docs/**/*',
      'node_modules',
      'prisma/**/*',
      'scripts/**/*',
      'tests/**/*',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
  },
  {
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
      node: node,
      security: security,
      prettier: prettier,
      promise: promise,
      unicorn: unicorn,
      functional: functional,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        ...globals.node,
      },
    },
  },
  {
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.ts'],
        },
      },
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      'prettier/prettier': 'error',

      // TypeScript Rules
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unnecessary-type-arguments': 'error',
      '@typescript-eslint/prefer-includes': 'error',
      '@typescript-eslint/return-await': ['error', 'always'],
      '@typescript-eslint/prefer-promise-reject-errors': 'error',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-module-boundary-types': ['error', { allowedNames: [] }],
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/promise-function-async': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/method-signature-style': ['error', 'property'],
      '@typescript-eslint/no-empty-interface': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/no-dynamic-delete': 'error',
      '@typescript-eslint/no-unnecessary-type-constraint': 'error',
      '@typescript-eslint/prefer-reduce-type-parameter': 'error',
      '@typescript-eslint/prefer-ts-expect-error': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/sort-type-constituents': 'error',
      '@typescript-eslint/no-base-to-string': 'error',
      '@typescript-eslint/no-confusing-void-expression': 'error',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
      '@typescript-eslint/non-nullable-type-assertion-style': 'error',
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/array-type': ['error', { default: 'array', readonly: 'array' }],
      '@typescript-eslint/prefer-function-type': 'error',
      '@typescript-eslint/no-invalid-void-type': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false, properties: false } },
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: false, allowTypedFunctionExpressions: true },
      ],
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        { assertionStyle: 'as', objectLiteralTypeAssertions: 'never' },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'interface', format: ['PascalCase'] },
        { selector: 'typeAlias', format: ['PascalCase'] },
        { selector: 'enum', format: ['PascalCase'] },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
      ],
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowString: false,
          allowNumber: false,
          allowNullableObject: false,
          allowNullableBoolean: false,
          allowAny: false,
        },
      ],
      '@typescript-eslint/no-magic-numbers': [
        'error',
        {
          ignore: [-1, 0, 1, 2],
          ignoreArrayIndexes: true,
          enforceConst: true,
          detectObjects: true,
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Import & Path Rules
      'import/no-unresolved': 'error',
      'import/no-cycle': ['error', { maxDepth: Infinity }],
      'import/no-self-import': 'error',
      'import/no-useless-path-segments': 'error',
      'import/first': 'error',
      'import/no-duplicates': 'error',
      'import/extensions': ['error', 'never', { json: 'always' }],
      'import/newline-after-import': 'error',
      'import/no-absolute-path': 'error',
      'import/no-named-as-default': 'error',
      'import/no-named-as-default-member': 'error',
      'import/no-mutable-exports': 'error',
      'import/no-amd': 'error',
      'import/no-webpack-loader-syntax': 'error',
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/features/*',
              from: './src/features/!(shared)/*',
              message: 'Cross-feature dependencies are not allowed. Use shared modules instead.',
            },
          ],
        },
      ],
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          pathGroups: [
            {
              pattern: '#(app|server|bootstrap)',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '#(api)/**',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '#(config)/**',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '#(constant)/**',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '#(shared|decorators|errors|interceptors|middleware|validators|models)/**',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '#(utils)/**',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '#features/**',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '#(infrastructure)/**',
              group: 'internal',
              position: 'after',
            },

            {
              pattern: '#(types)/**',
              group: 'internal',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin', 'external'],
          'newlines-between': 'always-and-inside-groups',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/no-relative-parent-imports': 'off',
      'import/no-commonjs': 'error',

      // Node Rules
      'node/no-unpublished-import': 'error',
      'node/no-extraneous-import': 'error',
      'node/file-extension-in-import': 'off',
      'node/no-mixed-requires': 'error',
      'node/no-new-require': 'error',
      'node/process-exit-as-throw': 'error',
      'node/no-callback-literal': 'error',

      // Security Rules
      'security/detect-object-injection': 'error',
      'security/detect-non-literal-regexp': 'error',
      'security/detect-unsafe-regex': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-non-literal-require': 'error',
      'security/detect-non-literal-fs-filename': 'error',
      'security/detect-child-process': 'error',
      'security/detect-new-buffer': 'error',
      'security/detect-disable-mustache-escape': 'error',
      'security/detect-possible-timing-attacks': 'error',
      'security/detect-pseudoRandomBytes': 'error',
      'security/detect-no-csrf-before-method-override': 'error',
      'security/detect-bidi-characters': 'error',

      // Promise Rules
      'promise/prefer-await-to-then': 'error',
      'promise/no-multiple-resolved': 'error',
      'promise/always-return': 'error',
      'promise/param-names': 'error',
      'promise/catch-or-return': 'error',
      'promise/no-nesting': 'error',
      'promise/no-promise-in-callback': 'warn',
      'promise/no-callback-in-promise': 'warn',
      'promise/no-return-wrap': 'error',
      'promise/no-new-statics': 'error',
      'promise/valid-params': 'error',
      'promise/prefer-await-to-callbacks': 'error',

      // Unicorn Rules
      'unicorn/prefer-event-target': 'error',
      'unicorn/prefer-modern-math-apis': 'error',
      'unicorn/consistent-function-scoping': 'error',
      'unicorn/prefer-node-protocol': 'error',
      'unicorn/better-regex': 'error',
      'unicorn/catch-error-name': 'error',
      'unicorn/consistent-destructuring': 'error',
      'unicorn/error-message': 'error',
      'unicorn/explicit-length-check': 'error',
      'unicorn/filename-case': 'off',
      'unicorn/no-abusive-eslint-disable': 'error',
      'unicorn/no-array-for-each': 'off',
      'unicorn/no-array-push-push': 'error',
      'unicorn/no-console-spaces': 'error',
      'unicorn/no-empty-file': 'error',
      'unicorn/no-for-loop': 'off',
      'unicorn/no-hex-escape': 'error',
      'unicorn/no-instanceof-array': 'error',
      'unicorn/no-lonely-if': 'error',
      'unicorn/no-nested-ternary': 'error',
      'unicorn/no-new-array': 'error',
      'unicorn/no-new-buffer': 'error',
      'unicorn/no-null': 'off',
      'unicorn/no-object-as-default-parameter': 'error',
      'unicorn/no-process-exit': 'error',
      'unicorn/no-unreadable-array-destructuring': 'error',
      'unicorn/no-useless-undefined': 'error',
      'unicorn/no-zero-fractions': 'error',
      'unicorn/prefer-add-event-listener': 'error',
      'unicorn/prefer-array-find': 'error',
      'unicorn/prefer-array-flat': 'error',
      'unicorn/prefer-array-flat-map': 'error',
      'unicorn/prefer-array-index-of': 'error',
      'unicorn/prefer-array-some': 'error',
      'unicorn/prefer-date-now': 'error',
      'unicorn/prefer-default-parameters': 'error',
      'unicorn/prefer-includes': 'error',
      'unicorn/prefer-number-properties': 'error',
      'unicorn/prefer-optional-catch-binding': 'error',
      'unicorn/prefer-regexp-test': 'error',
      'unicorn/prefer-set-has': 'error',
      'unicorn/prefer-spread': 'error',
      'unicorn/prefer-string-replace-all': 'error',
      'unicorn/prefer-string-slice': 'error',
      'unicorn/prefer-string-starts-ends-with': 'error',
      'unicorn/prefer-string-trim-start-end': 'error',
      'unicorn/prefer-type-error': 'error',
      'unicorn/throw-new-error': 'error',

      // Functional Rules
      'functional/no-let': 'off',
      'functional/immutable-data': 'off',
      'functional/prefer-tacit': 'off',
      'functional/prefer-readonly-type': 'warn',
      'functional/no-mixed-types': 'off',
      'functional/no-conditional-statements': 'off',
      'functional/no-expression-statements': 'off',
      'functional/no-loop-statements': 'off',
      'functional/no-return-void': 'off',
      'functional/no-try-statements': 'off',
      'functional/no-throw-statements': 'off',
      'functional/prefer-property-signatures': 'error',
      'functional/no-promise-reject': 'off',
      'functional/prefer-immutable-types': 'off',
      'functional/functional-parameters': 'off',

      // General Rules
      'no-multi-assign': 'error',
      'no-console': ['error'],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['console'],
              message: 'Use the logger service instead. Import from "@shared/utils/logger"',
            },
          ],
        },
      ],
      'no-process-env': 'error',
      'no-restricted-globals': [
        'error',
        {
          name: 'process',
          message: 'Use environment config service instead of process.env directly',
        },
      ],
      'no-restricted-properties': [
        'error',
        {
          object: 'req',
          property: 'user',
          message: 'Use the auth service to access user information',
        },
      ],
      'no-throw-literal': 'error',
      'no-promise-executor-return': 'error',
      'no-await-in-loop': 'error',
      'no-unused-expressions': ['error', { allowShortCircuit: true }],
      'max-len': [
        'error',
        {
          code: 100,
          ignoreComments: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
        },
      ],
      'max-depth': [
        'error',
        {
          max: 4,
        },
      ],
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'no-param-reassign': 'error',
      'no-prototype-builtins': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'no-return-await': 'off',
      'array-callback-return': 'error',
      'no-array-constructor': 'error',
      'prefer-object-spread': 'error',
      'prefer-destructuring': ['error', { array: false, object: true }],
      'no-plusplus': 'off',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'require-atomic-updates': 'error',
      'no-template-curly-in-string': 'error',
      complexity: ['error', { max: 24 }],
      'max-params': ['error', { max: 4 }],
      'max-lines-per-function': ['error', { max: 100 }],
      'consistent-return': 'error',
      'no-else-return': 'error',
      'no-useless-return': 'error',
    },
  },
  prettierConfig,
];
