// External Dependencies
import { register } from 'tsconfig-paths';

/**
 * Path alias resolver for test environment
 *
 * Enables O(1) module resolution for imports with # prefixes
 * This improves V8's module loading performance in test environment
 */

// Register TypeScript path aliases for test environment
register({
  baseUrl: './src',
  paths: {
    '#config/*': ['./config/*'],
    '#shared/*': ['./shared/*'],
    '#utils/*': ['./utils/*'],
    '#features/*': ['./features/*'],
    '#types/*': ['./types/*'],
  },
});
