// Constants
import { NUMERIC_CONSTANTS } from '#constants/numeric';

// Shared Modules
import { tokenInvalidationService } from '#shared/services/token-invalidation.service';

// Utilities
import log from '#utils/observability/logger';

/**
 * Safely performs a token cleanup operation by invoking the `performCleanup` function.
 * Catches and logs any unexpected errors to prevent unhandled promise rejections.
 *
 * @async
 * @function
 * @returns {Promise<void>} A promise that resolves when the cleanup operation completes.
 * @throws This function does not throw errors directly but logs unexpected errors internally.
 */
const safeCleanup = async (): Promise<void> => {
  try {
    await performCleanup();
  } catch (unexpectedError) {
    // Catch any unexpected Promise rejections that might occur
    // This prevents unhandledRejection events
    log.error(
      'Unexpected error in token cleanup job',
      Object.freeze({
        error: unexpectedError instanceof Error ? unexpectedError.message : 'Unknown error',
        service: 'token-cleanup-job',
      })
    );
  }
};

/**
 * Performs a cleanup operation to remove expired tokens from the database.
 *
 * This function executes an asynchronous operation to delete expired tokens
 * and logs the results using structured logging. If an error occurs during
 * the cleanup process, it logs the error details.
 *
 * @async
 * @function
 * @returns {Promise<void>} A promise that resolves when the cleanup operation is complete.
 *
 * @throws {Error} Logs an error message if the cleanup operation fails.
 *
 * @example
 * // Call the function to clean up expired tokens
 * await performCleanup();
 */
const performCleanup = async (): Promise<void> => {
  try {
    // O(n) database operation where n is number of expired tokens
    const deletedCount = await tokenInvalidationService.cleanupExpiredTokens();

    // O(1) structured logging with metadata
    log.info(
      'Cleaned up expired tokens',
      Object.freeze({
        deletedCount,
        service: 'token-cleanup-job',
        timestamp: new Date().toISOString(),
      })
    );
  } catch (error) {
    // O(1) error handling with type narrowing
    log.error(
      'Failed to clean up expired tokens',
      Object.freeze({
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'token-cleanup-job',
        timestamp: new Date().toISOString(),
      })
    );
  }
};

/**
 * Sets up a scheduled job to clean up expired tokens
 *
 * Uses Node.js native scheduler to run daily cleanup operations
 * with proper error handling and logging
 *
 * @returns Function to stop the scheduled job
 *
 * O(1) setup complexity
 */
export const setupTokenCleanupJob = (): (() => void) => {
  const intervalId = setInterval(() => {
    void safeCleanup();
  }, NUMERIC_CONSTANTS.ONE_DAY_MS);

  // Run once at startup to clean any tokens that expired while service was down
  void safeCleanup();

  // Return a cleanup function that can be used to stop the scheduled job
  return (): void => {
    clearInterval(intervalId);
  };
};
