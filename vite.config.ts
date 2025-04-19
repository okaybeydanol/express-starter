// Node.js Core Modules
import { resolve } from 'path';
import os from 'os'; // Statik import kullan

// External Dependencies
import tsconfigPaths from 'vite-tsconfig-paths';
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

const MAX_THREADS = Math.max(1, Math.floor(os.cpus().length * 0.75));

export default defineConfig({
  plugins: [tsconfigPaths()],
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
    setupFiles: ['./tests/_config/setup.ts'],
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
    resolveSnapshotPath: (testPath, snapExtension) =>
      testPath.replace(/\.test\.([tj]s)$/, `${snapExtension}.$1`),
    // Enable test isolation
    isolate: true,
    // Thread pool creation strategy
    pool: 'threads',
    poolOptions: {
      threads: {
        minThreads: 1,
        maxThreads: Math.max(1, Math.floor(os.cpus().length * 0.75)),
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
