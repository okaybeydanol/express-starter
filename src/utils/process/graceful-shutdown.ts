// Constants
import { NUMERIC_CONSTANTS } from '#constants/numeric.js';

// Utilities
import { closeHealthConnections } from '#utils/health-check.js';
import log from '#utils/observability/logger.js';

// Type Imports
import type { createServer } from 'node:http';

/* eslint-disable unicorn/no-process-exit */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-process-env */

/**
 * Creates a graceful shutdown handler for an HTTP server.
 *
 * This function generates a shutdown handler that listens for specific signals
 * (`SIGINT` or `SIGTERM`) and performs a series of cleanup operations before
 * shutting down the server. It ensures that the shutdown process is executed
 * only once, even if multiple signals are received.
 *
 * @param server - The HTTP server instance created using `createServer`.
 * @param cleanupFn - A function to perform any necessary cleanup operations
 * before shutting down the server (e.g., closing database connections).
 * @returns A function that takes a signal (`SIGINT` or `SIGTERM`) and returns
 * a handler function to be executed when the signal is received.
 *
 * ### Example Usage:
 * ```typescript
 * const server = createServer(app);
 * const cleanup = () => {
 *   // Perform cleanup logic here
 * };
 * const gracefulShutdown = createGracefulShutdown(server, cleanup);
 * process.on('SIGINT', gracefulShutdown('SIGINT'));
 * process.on('SIGTERM', gracefulShutdown('SIGTERM'));
 * ```
 *
 * ### Notes:
 * - The shutdown process includes closing the server, cleaning up connections,
 *   and ensuring logs are flushed before exiting.
 * - If the process is running in a Nodemon environment, it forces an immediate
 *   exit using `SIGKILL`.
 * - Errors during the shutdown process are logged, and the process is forcibly
 *   terminated to prevent hanging.
 */
const createGracefulShutdown =
  (server: ReturnType<typeof createServer>, cleanupFn: () => void) =>
  (signal: 'SIGINT' | 'SIGTERM'): (() => void) => {
    // Atomic flag to prevent duplicate shutdown calls - O(1) shape stability
    let isShuttingDown = false;

    return (): void => {
      // O(1) duplicate shutdown prevention for better V8 inline caching
      if (isShuttingDown) {
        log.debug(`Ignoring duplicate ${signal} signal, shutdown already in progress`);
        return;
      }

      isShuttingDown = true;
      log.info(`${signal} signal received: initiating graceful shutdown`);

      // O(1) shutdown operation with deterministic cleanup
      cleanupFn();

      // Server closing with non-blocking pattern
      server.close((): void => {
        log.info('HTTP server closed');

        // O(1) async operation wrapper with explicit reference to avoid V8 deoptimizations
        const performCleanup = async (): Promise<void> => {
          const isNodemonProcess = process.env.IS_NODEMON === 'true';

          try {
            // O(1) connection cleanup with typed parameters for shape stability
            await closeHealthConnections({});
            log.info('All connections closed successfully');

            // Allow logs to be flushed with explicit delay
            // O(1) immediate execution in next event loop tick for log flushing
            if (isNodemonProcess) {
              log.info('Nodemon environment detected - forcing immediate exit');

              // O(1) non-blocking operation for event loop efficiency
              // setImmediate runs in the next tick which ensures logs are flushed
              setImmediate(() => {
                process.kill(process.pid, 'SIGKILL');
              });
            } else {
              // Production shutdown with minimal delay
              setTimeout(() => {
                process.exit(0);
              }, NUMERIC_CONSTANTS.SHUTDOWN_DELAY_MS);
            }
          } catch (error) {
            // O(1) error handling with type narrowing for optimal V8 shape retention
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : undefined;

            log.error('Unexpected error in shutdown handler:', {
              error: errorMessage,
              stack: errorStack,
            });

            // Force immediate exit on error with deterministic behavior
            process.kill(process.pid, 'SIGKILL');
          }
        };

        // Execute cleanup function without catch chains for better V8 optimization
        void performCleanup();
      });
    };
  };

export default createGracefulShutdown;
