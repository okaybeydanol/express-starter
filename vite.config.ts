// Node.js Core Modules
import { resolve } from 'path';

// External Dependencies
import { defineConfig } from 'vitest/config';

const tsconfig = require('./tsconfig.json');
const pathAliases = Object.entries(tsconfig.compilerOptions.paths || {}).reduce(
  (aliases, [alias, pathArray]) => {
    if (Array.isArray(pathArray) && pathArray.length > 0) {
      const aliasPath = pathArray[0];
      const key = alias.replace(/\/\*$/, '');
      aliases[key] = resolve(__dirname, aliasPath.replace(/\/\*$/, ''));
    }
    return aliases;
  },
  {} as Record<string, string>
);

export default defineConfig({
  resolve: {
    alias: pathAliases,
    // ESM preferred resolution strategy
    conditions: ['import', 'node', 'module', 'default'],
    // Node.js module resolution settings
    mainFields: ['module', 'main'],
  },
  test: {
    globals: true,
    environment: 'node',
    // Enable test isolation
    isolate: true,
    // Thread pool creation strategy
    pool: 'threads',
    poolOptions: {
      threads: {
        // Run parallel tests on up to 75% of CPU cores
        minThreads: 1,
        maxThreads: Math.max(1, Math.floor(require('os').cpus().length * 0.75)),
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/tests/**'],
      all: true,
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
    include: ['**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
  esbuild: {
    target: 'node18',
    format: 'esm',
    tsconfigRaw: '{"compilerOptions":{"preserveValueImports":true}}',
  },
});
