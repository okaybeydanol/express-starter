// Express & Middleware
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';

// Configuration
import { env } from '#config/env.js';

// Constants
import { DEFAULT_APP_CONFIG } from '#constants/default-app-config.js';
import { NUMERIC_CONSTANTS } from '#constants/numeric.js';

// Shared Modules
import { HTTP_STATUS_CODE } from '#shared/constants/http-status-codes.js';
import { createErrorMiddleware } from '#shared/middleware/error.middleware.js';
import { defaultRateLimiter } from '#shared/middleware/rate-limiter.middleware.js';

// Utilities
import { checkDatabaseHealth, getSystemHealth } from '#utils/health-check.js';
import log, { morganStream } from '#utils/observability/logger.js';
import { sendResponse } from '#utils/response.js';
import { logRequest } from '#utils/system.js';

// Type Imports
import type { AppConfig, IRoute } from '#types/route-types.js';
import type { Express, Request, Response } from 'express';

/**
 * Creates and configures an Express application instance.
 *
 * @param {AppConfig} [config=DEFAULT_APP_CONFIG] - The configuration object for the application.
 * @param {IRoute[]} config.routes - An array of route definitions to be registered with the application.
 * @returns {Express} - The configured Express application instance.
 *
 * @description
 * This function initializes an Express application with the following features:
 * - Security middleware: `helmet`, `cors`, `hpp`.
 * - Rate limiting: `defaultRateLimiter`.
 * - Body parsing: JSON and URL-encoded payloads with size limits.
 * - Cookie parsing: `cookieParser`.
 * - Request logging: `morgan` and custom request logging middleware.
 * - Response compression: `compression`.
 * - Static file serving: Serves files from the `public` directory.
 * - Health check endpoints:
 *   - `/health`: Checks overall system health.
 *   - `/health/db`: Checks database health.
 * - 404 handler for unmatched routes.
 * - Error handling middleware for centralized error processing.
 *
 * @example
 * ```typescript
 * import { createApp } from './app';
 * import { routes } from './routes';
 *
 * const app = createApp({ routes });
 * app.listen(3000, () => {
 *   console.log('Server is running on port 3000');
 * });
 * ```
 */
export const createApp = (config: AppConfig = DEFAULT_APP_CONFIG): Express => {
  const { routes } = config;
  const app = express();

  // Security and parsing middleware
  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(hpp());

  app.use(defaultRateLimiter);

  app.use(
    express.json({
      limit: `${NUMERIC_CONSTANTS.JSON_INDENT_SPACES * NUMERIC_CONSTANTS.JSON_INDENT_SPACES_MULTIPLY}mb`,
    })
  );
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Request logging
  app.use(morgan(env.logging.format, { stream: morganStream }));
  app.use(logRequest);

  app.use(compression());

  app.use(express.static('public'));

  // Routes
  routes.forEach((route: IRoute): void => {
    app.use(route.path, route.route);
  });

  // Health check endpoint
  app.get('/health', async (_req: Request, res: Response): Promise<void> => {
    try {
      const systemHealth = await getSystemHealth({});

      const statusCode =
        systemHealth.status === 'healthy'
          ? HTTP_STATUS_CODE.OK
          : systemHealth.status === 'degraded'
            ? HTTP_STATUS_CODE.PARTIAL_CONTENT
            : HTTP_STATUS_CODE.SERVICE_UNAVAILABLE;

      sendResponse(res, {
        status: statusCode,
        data: systemHealth,
        message: `System is ${systemHealth.status}`,
      });
    } catch (error) {
      log.error('Health check failed', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      sendResponse(res, {
        status: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        message: 'Could not determine system health',
      });
    }
  });

  app.get('/health/db', async (_req: Request, res: Response): Promise<void> => {
    try {
      const dbHealth = await checkDatabaseHealth({});

      const statusCode =
        dbHealth.status === 'healthy'
          ? HTTP_STATUS_CODE.OK
          : dbHealth.status === 'degraded'
            ? HTTP_STATUS_CODE.OK
            : HTTP_STATUS_CODE.SERVICE_UNAVAILABLE;

      sendResponse(res, {
        status: statusCode,
        data: dbHealth,
        message: `Database is ${dbHealth.status}`,
      });
    } catch (error) {
      log.error('Database health check failed', { error: String(error) });
      sendResponse(res, {
        status: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        message: 'Could not determine database health',
      });
    }
  });

  // 404 handler
  app.use((_req: Request, res: Response): void => {
    sendResponse(res, {
      status: HTTP_STATUS_CODE.NOT_FOUND,
      message: 'Resource not found',
    });
  });

  // Error handling middleware (must be last)
  app.use(createErrorMiddleware(log));

  return app;
};
