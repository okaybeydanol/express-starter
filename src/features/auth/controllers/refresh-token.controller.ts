// External Dependencies
import crypto from 'node:crypto';

// Shared Modules
import { HTTP_STATUS_CODE } from '#shared/constants/http-status-codes.js';
import createMetricsCollector from '#shared/utils/metrics-collector.js';

// Utilities
import log from '#utils/observability/logger.js';

// Parent Directory Imports
import { refreshTokenService } from '../services/refresh-token.service.js';

// Type Imports
import type { TypedRequestBody } from '#shared/types/express.js';
import type { RefreshTokenRequest } from '../types/auth.types.js';
import type { Response } from 'express';

/**
 * Controller for handling refresh token requests.
 *
 * This controller provides functionality to refresh an access token
 * using a valid refresh token. It includes performance monitoring
 * and error handling to ensure robust operation.
 *
 * @property refreshToken - Asynchronous method to handle the refresh token request.
 *
 * @method refreshToken
 * @param req - The Express request object containing the refresh token in the body.
 * @param res - The Express response object used to send the response.
 * @returns A Promise that resolves to void.
 *
 * ### Features:
 * - Logs the request details for debugging and monitoring.
 * - Collects performance metrics for the token refresh operation.
 * - Calls the `refreshTokenService` to validate and generate new tokens.
 * - Handles success and failure scenarios with appropriate HTTP status codes.
 * - Ensures minimal information leakage in error responses.
 *
 * ### Complexity:
 * - O(1) for token verification and generation.
 * - O(1) for metrics collection and logging.
 *
 * ### Error Handling:
 * - Returns `401 Unauthorized` if the refresh token is invalid or the operation fails.
 * - Returns `500 Internal Server Error` for unexpected errors.
 */
export const refreshTokenController = {
  /**
   * Refreshes an access token using a valid refresh token
   *
   * @param req - Express request with refresh token
   * @param res - Express response
   * @returns Promise resolving to void
   *
   * O(1) token verification and generation
   */
  refreshToken: async (
    req: TypedRequestBody<RefreshTokenRequest>,
    res: Response
  ): Promise<void> => {
    const requestId = (req.headers['x-request-id'] as string | undefined) ?? crypto.randomUUID();

    // O(1) metrics collection for performance monitoring
    const collector = createMetricsCollector();
    const stopTimer = collector.startTimer();

    try {
      log.info('Refresh token request', {
        requestId,
        endpoint: 'POST /api/auth/refresh',
        controller: 'refreshTokenController.refreshToken',
      });

      // O(1) service call for token refresh
      const result = await refreshTokenService.refreshToken(req.body.refreshToken);

      // O(1) timing completion
      stopTimer();
      const queryTime = collector.getMetric();

      if (!result.success) {
        res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json(
          Object.freeze({
            success: false,
            message: 'REFRESH_FAILED',
            error: result.error,
            queryTime,
          })
        );
        return;
      }

      log.info('Token refreshed successfully', {
        requestId,
        queryTime,
      });

      // Success response - O(1) operation
      res.status(HTTP_STATUS_CODE.OK).json(
        Object.freeze({
          success: true,
          message: 'TOKEN_REFRESHED',
          token: result.token,
          refreshToken: result.refreshToken,
          queryTime,
        })
      );
    } catch {
      // Stop timer even on unexpected errors
      stopTimer();

      log.error('Token refresh failed', {
        requestId,
        error: 'INTERNAL_SERVER_ERROR',
        queryTime: collector.getMetric(),
      });

      // O(1) error handling with minimal information leakage
      res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json(
        Object.freeze({
          success: false,
          message: 'INTERNAL_SERVER_ERROR',
          error: 'An unexpected error occurred',
        })
      );
    }
  },
};
