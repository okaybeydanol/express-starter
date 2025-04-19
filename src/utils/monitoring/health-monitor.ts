// Constants
import { NUMERIC_CONSTANTS } from '#constants/numeric.js';

// Utilities
import { getSystemHealth } from '#utils/health-check.js';
import log from '#utils/observability/logger.js';

/**
 * Monitors the system's health by performing checks on memory usage and service statuses.
 * Logs warnings or errors if thresholds are exceeded or services are unhealthy.
 *
 * @async
 * @function
 * @returns {Promise<void>} A promise that resolves when the health monitoring process completes.
 * @throws Logs an error if the health monitoring process encounters an issue.
 *
 * @example
 * // Example usage:
 * await monitorSystemHealth();
 *
 * Logs:
 * - A warning if memory usage exceeds the defined threshold.
 * - An error if the database service is not healthy.
 * - An error if the health monitoring process fails.
 */
const monitorSystemHealth = async (): Promise<void> => {
  try {
    const health = await getSystemHealth({});

    if (health.memory.heapUsed > NUMERIC_CONSTANTS.MEMORY_USAGE_THRESHOLD) {
      log.warn('High memory usage detected', {
        heapUsed: health.memory.heapUsed,
        rss: health.memory.rss,
      });
    }

    if (health.services.database.status !== 'healthy') {
      log.error('Database health check failed', {
        status: health.services.database.status,
        details: health.services.database.details,
      });
    }
  } catch (error) {
    log.error('Health monitoring failed', { error: String(error) });
  }
};

/**
 * Executes the health monitoring process for the system.
 * This function attempts to monitor the system's health by invoking
 * the `monitorSystemHealth` function. If an error occurs during the
 * monitoring process, it logs the error with a descriptive message.
 *
 * @returns {Promise<void>} A promise that resolves when the health monitoring process completes.
 */
const executeHealthMonitor = async (): Promise<void> => {
  try {
    await monitorSystemHealth();
  } catch (error) {
    log.error('Unhandled error in health monitor', { error: String(error) });
  }
};

/**
 * A wrapper function that invokes the `executeHealthMonitor` function.
 * This wrapper ensures that the execution of `executeHealthMonitor` is
 * handled without awaiting its result, allowing it to run asynchronously.
 *
 * @remarks
 * The `void` operator is used to suppress any returned value from
 * `executeHealthMonitor`, ensuring that it is not accidentally used.
 */
const executeHealthMonitorWrapper = (): void => {
  void executeHealthMonitor();
};

export const startHealthMonitoring = (): (() => void) => {
  // Calculate interval in milliseconds (5 * 60 * 100 = 30000ms or 30s)
  const interval =
    NUMERIC_CONSTANTS.HEALTH_CHECK_INTERVAL_MS_FIVE *
    NUMERIC_CONSTANTS.HEALTH_CHECK_INTERVAL_MS_SIXTY *
    NUMERIC_CONSTANTS.HEALTH_CHECK_INTERVAL_MS_ONE_HUNDRED;

  // Run once immediately
  void executeHealthMonitor();

  // Set up interval
  const intervalId = setInterval(executeHealthMonitorWrapper, interval);

  // Return function to stop monitoring
  return () => {
    clearInterval(intervalId);
  };
};
