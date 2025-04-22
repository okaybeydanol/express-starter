// Shared Modules
import { HTTP_STATUS_CODE } from '#shared/constants/http-status-codes.js';
import createMetricsCollector from '#shared/utils/metrics-collector';

// Utilities
import log from '#utils/observability/logger';

// Parent Directory Imports
import { loginService } from '../services/auth.service.js';

// Type Imports
import type { TypedRequestBody } from '#shared/types/express';
import type { LoginRequest } from '../types/auth.types.js';
import type { Response } from 'express';

/**
 * The `loginController` provides functionality to handle user login requests.
 * It validates user credentials, interacts with the login service, and returns
 * appropriate responses, including authentication tokens and user data.
 *
 * @property login - Handles the login process, including:
 *   - Validating the request body for login credentials.
 *   - Delegating the authentication process to the login service.
 *   - Collecting performance metrics for the operation.
 *   - Returning success or error responses based on the authentication result.
 *
 * The controller ensures minimal information leakage in error responses and
 * logs relevant details for monitoring and debugging purposes.
 */
export const loginController = {
  /**
   * Handles login requests, validating credentials and returning tokens.
   *
   * @param req - Express request object with login credentials
   * @param res - Express response object for sending the result
   *
   * O(1) validation and service delegation
   */
  login: async (req: TypedRequestBody<LoginRequest>, res: Response): Promise<void> => {
    const requestId = (req.headers['x-request-id'] as string | undefined) ?? crypto.randomUUID();

    // O(1) metrics collection for performance monitoring
    const collector = createMetricsCollector();
    const stopTimer = collector.startTimer();

    try {
      log.info('Create user', {
        requestId,
        endpoint: 'POST /api/auth',
        controller: 'loginController.login',
      });

      // Call login service - O(1) database lookup through service
      const result = await loginService.login(req.body);

      // O(1) timing completion
      stopTimer();
      const queryTime = collector.getMetric();

      if (!result.success) {
        res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json(
          Object.freeze({
            success: false,
            message: 'AUTHENTICATION_FAILED',
            error: result.error,
            queryTime,
          })
        );
        return;
      }

      log.info('User login successfully', {
        requestId,
        queryTime,
      });

      // Success response - O(1) operation
      res.status(HTTP_STATUS_CODE.OK).json(
        Object.freeze({
          success: true,
          message: 'AUTHENTICATION_SUCCESS',
          token: result.token,
          refreshToken: result.refreshToken,
          user: result.data,
          queryTime,
        })
      );
    } catch {
      // Stop timer even on unexpected errors
      stopTimer();

      log.error('User login failed', {
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
