// Shared Modules
import { HTTP_STATUS_CODE } from '#shared/constants/http-status-codes.js';
import createMetricsCollector from '#shared/utils/metrics-collector.js';

// Utilities
import { log } from '#utils/observability/logger.js';

// Parent Directory Imports
import { getAllUsersService } from '../services/get-all-users.service.js';

// Type Imports
import type { Request, Response } from 'express';

/**
 * Controller for handling the retrieval of all users.
 *
 * This controller provides an endpoint to fetch all users from the system.
 * It includes structured logging, error handling, and performance metrics.
 *
 * @remarks
 * - The function uses nullish coalescing to ensure a valid request ID is generated.
 * - Performance metrics are captured using high-precision timestamps.
 * - Errors are logged with detailed context for debugging purposes.
 *
 * @param req - The Express request object (unused in this controller).
 * @param res - The Express response object used to send the response.
 *
 * @returns A promise that resolves when the response is sent.
 *
 * @complexity
 * - O(1) for generating request ID and capturing timestamps.
 * - O(n) for fetching users, where n is the number of users.
 *
 * @example
 * ```typescript
 * import { getAllUsersController } from './controllers/get-all-users.controller';
 *
 * app.get('/users', getAllUsersController.getAllUsers);
 * ```
 *
 * @throws
 * - Responds with a 500 status code if an error occurs during user retrieval.
 *
 * @logs
 * - Logs the start and end of the operation with execution time.
 * - Logs errors with detailed context, including stack traces in non-production environments.
 */
export const getAllUsersController = {
  /**
   * Retrieves all users from the system
   *
   * @param req - Express request object (unused)
   * @param res - Express response object
   * @returns Promise<void> - Resolves when response is sent
   *
   * O(n) complexity where n is the number of users
   */
  getAllUsers: async (req: Request, res: Response): Promise<void> => {
    const requestId = (req.headers['x-request-id'] as string | undefined) ?? crypto.randomUUID();

    // O(1) metrics collection for performance monitoring
    const collector = createMetricsCollector();
    const stopTimer = collector.startTimer();

    try {
      log.info('Fetching all users', {
        requestId,
        endpoint: 'GET /users',
        controller: 'getAllUsersController.getAllUsers',
      });

      // O(n) service call with business logic
      const result = await getAllUsersService.getAllUsers();

      // O(1) timing completion
      stopTimer();
      const queryTime = collector.getMetric();

      if (!result.success) {
        log.error('Failed to fetch users', {
          requestId,
          error: result.error,
          queryTime: collector.getMetric(),
        });

        // O(1) error response formatting
        res.status(HTTP_STATUS_CODE.BAD_REQUEST).json(
          Object.freeze({
            success: false,
            message: 'USERS_FETCH_FAILED',
            error: result.error,
            queryTime: queryTime,
          })
        );
        return;
      }

      log.info('Users fetched successfully', {
        requestId,
        count: result.data.length,
        queryTime: collector.getMetric(),
      });

      // O(1) success response formatting
      res.status(HTTP_STATUS_CODE.OK).json(
        Object.freeze({
          success: true,
          message: 'USERS_FETCHED_SUCCESSFULLY',
          data: result.data,
          count: result.data.length,
          queryTime: queryTime,
        })
      );
    } catch {
      // Stop timer even on unexpected errors
      stopTimer();

      log.error('Failed to fetch users', {
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
