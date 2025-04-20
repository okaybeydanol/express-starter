// Application Core
import { bootstrap } from '#bootstrap';

// Utilities
import log from '#utils/observability/logger.js';

// Features
import createUserRoutes from '#features/users/routes/create-user.routes.js';
import getAllUsersRoutes from '#features/users/routes/get-all-users.routes.js';

// Type Imports
import type { AppConfig } from '#types/route-types.js';

/* eslint-disable unicorn/no-process-exit */
/* eslint-disable no-restricted-globals */

/**
 * The main entry point for the application.
 *
 * This function initializes the application by configuring it with the necessary routes
 * and bootstrapping it with the provided configuration. If an error occurs during the
 * startup process, it logs the error details and terminates the process with a non-zero
 * exit code.
 *
 * @returns A promise that resolves when the application is successfully started.
 */
const main = async (): Promise<void> => {
  try {
    // Application configuration with routes
    const appConfig: AppConfig = {
      routes: [getAllUsersRoutes, createUserRoutes],
    };

    // Bootstrap application with config
    await bootstrap(appConfig);
  } catch (error) {
    log.error('Application startup failed', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    process.exit(1);
  }
};

// Start the application
void main();
