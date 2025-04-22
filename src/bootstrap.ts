// External Dependencies
import { createServer } from 'node:http';

// Application Core
import { createApp } from '#app';

// Configuration
import { initDatabase } from '#config/client.js';
import { env } from '#config/env.js';

// Utilities
import { startHealthMonitoring } from '#utils/monitoring/health-monitor.js';
import log from '#utils/observability/logger.js';
import createGracefulShutdown from '#utils/process/graceful-shutdown.js';
import { setupTokenCleanupJob } from '#utils/setup-token-cleanup-job.utils';

// Type Imports
import type { AppConfig } from '#types/route-types.js';
import type { Express } from 'express';
import type { RequestListener } from 'node:http';

/* eslint-disable no-restricted-globals */
/**
 * Bootstraps the application by initializing the Express app, setting up the server,
 * configuring health monitoring, and registering signal and error handlers.
 *
 * @param config - The application configuration object of type `AppConfig`.
 * @returns A promise that resolves to a cleanup function, which can be invoked
 *          to programmatically shut down the server and stop health monitoring.
 *
 * @throws Will throw an error if the server fails to start or if any initialization
 *         step encounters an issue.
 *
 * ### Key Features:
 * - **App Initialization**: Creates an Express app with the provided configuration.
 * - **Server Setup**: Instantiates an HTTP server and binds it to the Express app.
 * - **Health Monitoring**: Starts health monitoring with a deterministic start/stop pattern.
 * - **Signal Handling**: Registers handlers for `SIGTERM` and `SIGINT` signals to enable
 *   graceful shutdown of the server and health monitoring.
 * - **Error Handling**: Configures global error handlers for uncaught exceptions and
 *   unhandled promise rejections, ensuring proper logging of errors.
 * - **Server Startup**: Starts the server on the configured port and logs the startup
 *   details, including the environment and version.
 * - **Cleanup Function**: Returns a cleanup function for explicit shutdown in test
 *   environments or programmatic use cases.
 */
export const bootstrap = async (config: AppConfig): Promise<() => void> => {
  try {
    // O(1) database initialization before app creation
    // This ensures database is ready before handling any requests
    await initDatabase();

    // O(1) app instantiation with immutable configuration
    const app: Express = createApp(config);

    // O(1) server creation with typed casting
    const server = createServer(app as unknown as RequestListener);

    // O(1) health monitoring setup with deterministic start/stop pattern
    const stopHealthMonitoring = startHealthMonitoring();

    // O(1) token cleanup job setup with consistent function shape
    const stopTokenCleanup = setupTokenCleanupJob();

    // O(1) signal handler registration with monomorphic function references
    // Using named function constants for V8 shape optimization
    const shutdownFactory = createGracefulShutdown(server, () => {
      log.info('Graceful shutdown initiated');
      stopHealthMonitoring();
      stopTokenCleanup();
    });
    const handleSigterm = shutdownFactory('SIGTERM');
    const handleSigint = shutdownFactory('SIGINT');

    process.on('SIGTERM', handleSigterm);
    process.on('SIGINT', handleSigint);

    // O(1) global error handlers with optimized type narrowing
    const handleUncaughtException = (error: Error): void => {
      log.error('Uncaught exception', {
        error: error.message,
        stack: error.stack,
      });
    };

    const handleUnhandledRejection = (reason: unknown): void => {
      const errorMessage = reason instanceof Error ? reason.message : String(reason);
      const errorStack = reason instanceof Error ? reason.stack : undefined;

      log.error('Unhandled rejection', {
        reason: errorMessage,
        stack: errorStack,
      });
    };

    process.on('uncaughtException', handleUncaughtException);
    process.on('unhandledRejection', handleUnhandledRejection);

    // O(1) server startup with minimal closure allocation
    await new Promise<void>((resolve) => {
      server
        .listen(env.port, () => {
          log.info(`Server running on port ${env.port} in ${env.nodeEnv} mode`, {
            metadata: {
              service: 'express-api',
              port: env.port,
              environment: env.nodeEnv,
              version: env.version,
            },
          });
          resolve();
        })
        .on('error', (error) => {
          log.error(`Failed to start server: ${error.message}`);
        });
    });

    // Register explicit cleanup function for test environments or programmatic shutdown
    return (): void => {
      log.info('Programmatic shutdown initiated');
      stopHealthMonitoring();
      stopTokenCleanup();
      server.close();
    };
  } catch (error) {
    // O(1) startup error handling with optimized type checking
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    log.error('Failed to start server', {
      error: errorMessage,
      stack: errorStack,
    });
    throw error;
  }
};
