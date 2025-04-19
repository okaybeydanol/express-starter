// Node.js Core Modules
import os from 'node:os';

// Prisma & DB
import { PrismaClient } from '@prisma/client';

// Configuration
import { env } from '#config/env.js';

// Constants
import { NUMERIC_CONSTANTS } from '#constants/numeric.js';

// Utilities
import { withLogging } from '#utils/observability/logger.js';
import { getMemoryUsage, getUptime } from '#utils/system.js';

// Type Imports
import type {
  HealthStatus,
  ServiceHealth,
  SystemHealth,
  GetSystemHealthParams,
} from '#types/health-check-types.js';

// Singleton Prisma instance for health checks only
// Keep separate from main service connections to prevent connection pool impact
const healthPrisma = new PrismaClient();

/**
 * Performs a health check on the database by executing a simple scalar query
 * to verify connectivity and measure latency.
 *
 * @returns {Promise<ServiceHealth>} A promise that resolves to a `ServiceHealth` object
 * indicating the status of the database connection:
 * - `healthy` if the latency is below the defined threshold.
 * - `degraded` if the latency exceeds the threshold.
 * - `unhealthy` if an error occurs during the query.
 *
 * The `details` property of the returned object includes:
 * - `latency`: The time taken (in milliseconds) to execute the query.
 * - `connection`: The status of the database connection (e.g., 'active').
 * - `error`: The error message if the status is `unhealthy`.
 */
const performDatabaseHealthCheck = async (): Promise<ServiceHealth> => {
  const startTime = performance.now();

  try {
    // Simple scalar query to check DB connectivity with minimal overhead
    await healthPrisma.$queryRaw`SELECT 1 as health_check`;
    const latency = Math.round(performance.now() - startTime);

    // Evaluate: Under threshold is healthy, above is degraded
    return Object.freeze({
      status: latency < NUMERIC_CONSTANTS.LATENCY_THRESHOLD ? 'healthy' : 'degraded',
      details: { latency, connection: 'active' },
    });
  } catch (error) {
    return Object.freeze({
      status: 'unhealthy',
      details: { error: error instanceof Error ? error.message : String(error) },
    });
  }
};

/**
 * Checks the health of the database and logs the result.
 *
 * This function wraps the `performDatabaseHealthCheck` with logging functionality.
 * It logs the result of the health check based on the specified configuration.
 *
 * @remarks
 * - Logs detailed results only in development mode or when the logging level is set to 'debug'.
 * - Reduces noise in production by limiting detailed logging.
 *
 * @example
 * ```typescript
 * const healthStatus = await checkDatabaseHealth();
 * console.log(healthStatus);
 * ```
 *
 * @see {@link performDatabaseHealthCheck} for the underlying health check logic.
 *
 * @returns A promise that resolves with the result of the database health check.
 */
export const checkDatabaseHealth = withLogging(performDatabaseHealthCheck, {
  name: 'checkDatabaseHealth',
  logLevel: 'http',
  logResult: true,
  // Only log detailed results in development or when unhealthy to reduce noise
  shouldLog: () => !env.isProduction || env.logging.level === 'debug',
});

/**
 * Collects and returns the system health information, including memory usage,
 * CPU load, uptime, application version, and the health status of dependent services.
 *
 * @async
 * @function
 * @returns {Promise<SystemHealth>} A promise that resolves to an object containing
 * the overall system health status, memory usage, CPU metrics, uptime, application version,
 * and the health status of services such as the database.
 *
 * @example
 * const health = await collectSystemHealth();
 * console.log(health.status); // 'healthy', 'degraded', or 'unhealthy'
 *
 * @remarks
 * - Memory usage is reported in MB and rounded to the nearest integer.
 * - CPU metrics include the load average and the number of CPU cores.
 * - The health status of services is determined by their individual checks.
 */
const collectSystemHealth = async (): Promise<SystemHealth> => {
  // Memory usage in MB - V8 heap metrics
  const memoryUsage = getMemoryUsage();

  // Run all service health checks in parallel - O(1) efficiency
  const [dbHealth] = await Promise.all([performDatabaseHealthCheck()]);

  // Overall status assessment
  let overallStatus: HealthStatus = 'healthy';
  if (dbHealth.status === 'unhealthy') {
    overallStatus = 'unhealthy';
  } else if (dbHealth.status === 'degraded') {
    overallStatus = 'degraded';
  }

  return Object.freeze({
    status: overallStatus,
    uptime: getUptime(),
    version: env.version,
    memory: Object.freeze({
      rss: Math.round(
        memoryUsage.rss / NUMERIC_CONSTANTS.MATH_ROUND_DIVIDE / NUMERIC_CONSTANTS.MATH_ROUND_DIVIDE
      ),
      heapTotal: Math.round(
        memoryUsage.heapTotal /
          NUMERIC_CONSTANTS.MATH_ROUND_DIVIDE /
          NUMERIC_CONSTANTS.MATH_ROUND_DIVIDE
      ),
      heapUsed: Math.round(
        memoryUsage.heapUsed /
          NUMERIC_CONSTANTS.MATH_ROUND_DIVIDE /
          NUMERIC_CONSTANTS.MATH_ROUND_DIVIDE
      ),
      external: Math.round(
        memoryUsage.external /
          NUMERIC_CONSTANTS.MATH_ROUND_DIVIDE /
          NUMERIC_CONSTANTS.MATH_ROUND_DIVIDE
      ),
      arrayBuffers: Math.round(
        memoryUsage.arrayBuffers /
          NUMERIC_CONSTANTS.MATH_ROUND_DIVIDE /
          NUMERIC_CONSTANTS.MATH_ROUND_DIVIDE
      ),
    }),
    cpu: Object.freeze({
      loadAvg: Object.freeze(os.loadavg()),
      cpuCount: os.cpus().length,
    }),
    services: Object.freeze({
      database: dbHealth,
    }),
  });
};

/**
 * Retrieves the system health information by collecting various metrics.
 * This function is wrapped with logging capabilities to provide detailed
 * insights into its execution, including the ability to log results and
 * control logging behavior based on the environment.
 *
 * @function getSystemHealth
 * @template GetSystemHealthParams - The type of the parameters required for the health check.
 * @template SystemHealth - The type of the system health data returned.
 * @param {GetSystemHealthParams} params - The parameters required to collect system health.
 * @returns {SystemHealth} The collected system health information.
 *
 * @remarks
 * - Logging is enabled based on the environment configuration.
 * - Results are logged if `logResult` is set to `true`.
 * - The logging level and conditions can be customized via the `shouldLog` function.
 *
 * @see withLogging - The higher-order function used to wrap the health check logic.
 * @see collectSystemHealth - The underlying function that performs the health check.
 */
export const getSystemHealth = withLogging<GetSystemHealthParams, SystemHealth>(
  collectSystemHealth,
  {
    name: 'getSystemHealth',
    logLevel: 'http',
    logResult: true,
    shouldLog: () => !env.isProduction || env.logging.level === 'debug',
  }
);

/**
 * Closes the health-related database connections gracefully.
 *
 * This function uses the `withLogging` utility to ensure that the operation
 * is logged with the specified log level and name. It disconnects the
 * `healthPrisma` client to release any active connections.
 *
 * @async
 * @function
 * @returns {Promise<void>} A promise that resolves when the connections are successfully closed.
 */
export const closeHealthConnections = withLogging(
  async (): Promise<void> => {
    await healthPrisma.$disconnect();
  },
  {
    name: 'closeHealthConnections',
    logLevel: 'info',
    shouldLog: () => true,
  }
);
