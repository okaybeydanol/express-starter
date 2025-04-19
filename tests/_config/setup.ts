// External Dependencies
import { afterEach, beforeAll, beforeEach, vi } from 'vitest';

// Sibling Directory Imports
import './aliasers';

/**
 * Test environment setup for Express Starter
 *
 * Configures the testing environment with proper mocks and lifecycle hooks to ensure:
 * - O(1) module resolution for path aliases
 * - Consistent V8 hidden class shapes for optimal JIT compilation
 * - Isolated test environments with proper cleanup between tests
 */

/**
 * Mock environment configuration
 * Provides consistent environment variables for tests with O(1) access patterns
 */
vi.mock('#config/env', () => ({
  env: {
    nodeEnv: 'test',
    isProduction: false,
    port: 3000,
    corsOrigin: '*',
    logging: {
      level: 'silent',
      format: 'dev',
    },
  },
}));

/**
 * Mock HTTP status codes
 * Ensures consistent status code references with O(1) property access
 */
vi.mock('#shared/constants/http-status-codes', () => ({
  HTTP_STATUS_CODE: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  },
}));

/**
 * Mock logger functionality with monomorphic shape for V8 optimization
 * Ensures consistent property access patterns for inline caching
 */
vi.mock('#utils/observability/logger.js', () => ({
  log: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
  },
}));

/**
 * Global setup before all tests
 * Runs once at O(1) complexity for the entire test suite
 */
beforeAll(() => {
  console.log('Test environment initialized');
});

/**
 * Setup before each test
 * Ensures O(1) cleanup of mocks for test isolation
 */
beforeEach(() => {
  vi.clearAllMocks();
});

/**
 * Cleanup after each test
 * Performs O(1) mock state reset to ensure test isolation
 */
afterEach(() => {
  vi.clearAllMocks();
});
