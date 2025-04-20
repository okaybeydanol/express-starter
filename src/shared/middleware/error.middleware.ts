// Shared Modules
import { HTTP_STATUS_CODE } from '#shared/constants/http-status-codes.js';

// Utilities
import { sendResponse } from '#utils/response.js';

// Type Imports
import type { LogMetadata } from '#types/with-logging-types.js';
import type log from '#utils/observability/logger.js';
import type { Request, Response, NextFunction } from 'express';

/**
 * Creates an error-handling middleware for an Express application.
 *
 * This middleware handles specific error types (e.g., validation errors)
 * and logs error details using the provided logger. For validation errors,
 * it sends a `400 Bad Request` response with the error details. For other
 * errors, it logs the error and sends a `500 Internal Server Error` response.
 *
 * @param logger - A logging utility that conforms to the `log` interface.
 *                 Used to log error details and metadata.
 * @returns An Express error-handling middleware function.
 *
 * @example
 * ```typescript
 * import { createErrorMiddleware } from './error.middleware';
 * import { log } from './logger';
 *
 * const errorMiddleware = createErrorMiddleware(log);
 * app.use(errorMiddleware);
 * ```
 */
export const createErrorMiddleware =
  (logger: typeof log) =>
  (error: Error, req: Request, res: Response, _next: NextFunction): void => {
    if (error.name === 'ValidationError') {
      // Handle validation errors
      sendResponse(res, {
        status: HTTP_STATUS_CODE.BAD_REQUEST,
        message: 'Validation error',
        data: { details: error.message },
      });
      return;
    }

    const meta: Readonly<LogMetadata> = {
      ip: req.ip,
      method: req.method,
      path: req.path,
      stack: error.stack,
    };

    logger.error(`Error: ${error.message}`, meta);

    sendResponse(res, {
      status: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  };
