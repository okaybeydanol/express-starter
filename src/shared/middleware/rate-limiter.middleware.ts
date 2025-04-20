// Express & Middleware
import rateLimit from 'express-rate-limit';

// Configuration
import { env } from '#config/env.js';

// Constants
import { NUMERIC_CONSTANTS } from '#constants/numeric.js';

// Shared Modules
import { HTTP_STATUS_CODE } from '#shared/constants/http-status-codes.js';

// Utilities
import log from '#utils/observability/logger.js';
import { sendResponse } from '#utils/response.js';

// Type Imports
import type { RateLimiterConfig } from '#types/middleware-types.js';
import type { LogMetadata } from '#types/with-logging-types.js';
import type { Request, Response, NextFunction } from 'express';
import type { RateLimitRequestHandler } from 'express-rate-limit';

// Type-safe rate limiter configuration

// Pure function to create rate limiter middleware
/**
 * Creates a rate limiter middleware function to control the rate of incoming requests.
 *
 * @param config - Configuration object for the rate limiter.
 * @param config.windowMs - The time window in milliseconds for which the rate limit applies.
 * @param config.max - The maximum number of requests allowed within the time window.
 * @param config.message - The message to send when the rate limit is exceeded.
 * @returns A middleware function that enforces rate limiting on incoming requests.
 *
 * The middleware uses the `express-rate-limit` package to enforce rate limits. If the rate limit
 * is exceeded, it logs a warning with metadata about the request and sends a response with a
 * "Too Many Requests" status code and a retry-after message. In development mode, the rate limiter
 * is bypassed, and a debug log is generated instead.
 */
export const createRateLimiter = (
  config: RateLimiterConfig
): ((req: Request, res: Response, next: NextFunction) => void) => {
  const { windowMs, max, message } = config;

  const limiter: RateLimitRequestHandler = rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response): void => {
      const retryAfter = res.get('Retry-After') ?? '0';
      const timeRemainingMinutes = Math.ceil(
        Number.parseInt(retryAfter, NUMERIC_CONSTANTS.RADIX_TEN) /
          NUMERIC_CONSTANTS.SECONDS_PER_MINUTE
      );
      const meta: Readonly<LogMetadata> = {
        ip: req.ip,
        path: req.path,
        method: req.method,
        retryAfter: timeRemainingMinutes,
      };

      log.warn(`Rate limit exceeded: ${req.ip} on ${req.path}`, meta);

      sendResponse(res, {
        status: HTTP_STATUS_CODE.TOO_MANY_REQUESTS,
        message: `${message}. Please try again after ${timeRemainingMinutes} minute(s).`,
      });
    },
  });

  // Higher-order function to conditionally apply rate limiting
  return (req: Request, res: Response, next: NextFunction): void => {
    if (env.isDevelopment) {
      log.debug(`Bypassing rate limiter for ${req.path} in development`, {
        ip: req.ip,
        method: req.method,
      });
      next();
    } else {
      void limiter(req, res, next);
    }
  };
};

// Default rate limiter configuration
export const defaultRateLimiter = createRateLimiter({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  message: 'Too many requests from this IP',
});
