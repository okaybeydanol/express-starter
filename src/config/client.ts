// Node.js Core Modules
import { env } from 'node:process';

// Prisma & DB
import { PrismaClient } from '@prisma/client';

// Utilities
import log from '#utils/observability/logger';

// Type Imports
import type { Prisma } from '@prisma/client';

/* eslint-disable unicorn/no-process-exit */
/* eslint-disable no-restricted-globals */
/**
 * Singleton Prisma client instance for the application
 * Ensures single connection pool across all imports
 *
 * @module database/client
 */

// Environment-based log levels for optimal debugging and performance
const logLevels: readonly Prisma.LogLevel[] =
  env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'];

// Create singleton instance with O(1) initialization
export const prisma = new PrismaClient({
  log: [...logLevels],
  // Configure connection pooling for O(1) connection acquisition
  // Default: min: 2, max based on environment connection limits
});

// Handle unexpected shutdowns with graceful connection termination
const handleShutdown = async (): Promise<void> => {
  await prisma.$disconnect();
  process.exit(0);
};

// Register O(1) event handlers for proper resource cleanup
// Wrap async function in non-async handler to resolve TypeScript warning
process.on('SIGINT', () => {
  void handleShutdown();
});

process.on('SIGTERM', () => {
  void handleShutdown();
});

/**
 * Initializes database connection and runs health check
 * Should be called during application startup
 *
 * @returns Promise resolving when connection is verified
 */
export const initDatabase = async (): Promise<void> => {
  try {
    // Execute a simple query to verify connection with O(1) complexity
    await prisma.$queryRaw`SELECT 1`;
    log.info('✅ Database connection established');
  } catch (error) {
    // Transform unknown error to properly typed object with O(1) complexity
    const errorContext = {
      message: error instanceof Error ? error.message : 'Unknown database error',
      code: error instanceof Error && 'code' in error ? error.code : 'UNKNOWN',
      stack: error instanceof Error ? error.stack : undefined,
    };

    log.error('❌ Database connection failed:', { error: errorContext });
    // Exit to allow container orchestration to restart the service
    process.exit(1);
  }
};
