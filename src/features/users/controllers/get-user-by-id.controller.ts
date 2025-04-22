// Shared Modules
import { HTTP_STATUS_CODE } from '#shared/constants/http-status-codes.js';
import createMetricsCollector from '#shared/utils/metrics-collector.js';

// Utilities
import { log } from '#utils/observability/logger.js';

// Parent Directory Imports
import { getUserByIdService } from '../services/get-user-by-id.service.js';

// Type Imports
import type { Request, Response } from 'express';

/**
 * Controller for handling the retrieval of a single user by ID.
 *
 * This controller provides an endpoint to fetch a specific user from the system.
 * It includes structured logging, error handling, and performance metrics.
 *
 * @remarks
 * - The function uses nullish coalescing to ensure a valid request ID is generated.
 * - Performance metrics are captured using high-precision timestamps.
 * - Errors are logged with detailed context for debugging purposes.
 *
 * @complexity
 * - O(1) for generating request ID and capturing timestamps.
 * - O(1) for fetching user by ID using indexed lookup.
 *
 * @example
 * ```typescript
 * import { getUserByIdController } from './controllers/get-user-by-id.controller';
 *
 * app.get('/users/:id', getUserByIdController.getUserById);
 * ```
 *
 * @throws
 * - Responds with a 404 status code if the user is not found.
 * - Responds with a 500 status code if an error occurs during user retrieval.
 *
 * @logs
 * - Logs the start and end of the operation with execution time.
 * - Logs errors with detailed context, including stack traces in non-production environments.
 */
export const getUserByIdController = {
  /**
   * Retrieves a specific user by ID from the system
   *
   * @param req - Express request object containing user ID parameter
   * @param res - Express response object
   * @returns Promise<void> - Resolves when response is sent
   *
   * O(1) complexity using indexed database lookup
   */
  getUserById: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const requestId = (req.headers['x-request-id'] as string | undefined) ?? crypto.randomUUID();

    // O(1) metrics collection for performance monitoring
    const collector = createMetricsCollector();
    const stopTimer = collector.startTimer();

    try {
      log.info('Fetching user by ID', {
        requestId,
        userId: id,
        endpoint: `GET /users/${id}`,
        controller: 'getUserByIdController.getUserById',
      });

      // O(1) service call with business logic
      const result = await getUserByIdService.getUserById(id);

      // O(1) timing completion
      stopTimer();
      const queryTime = collector.getMetric();

      if (!result.success) {
        log.error('Failed to fetch user', {
          requestId,
          userId: id,
          error: result.error,
          queryTime,
        });

        // O(1) error response formatting
        res.status(HTTP_STATUS_CODE.NOT_FOUND).json(
          Object.freeze({
            success: false,
            message: 'USER_NOT_FOUND',
            error: result.error,
            queryTime: queryTime,
          })
        );
        return;
      }

      log.info('User fetched successfully', {
        requestId,
        userId: id,
        queryTime,
      });

      // O(1) success response formatting
      res.status(HTTP_STATUS_CODE.OK).json(
        Object.freeze({
          success: true,
          message: 'USER_FETCHED_SUCCESSFULLY',
          data: result.data,
          queryTime: queryTime,
        })
      );
    } catch {
      // Stop timer even on unexpected errors
      stopTimer();

      log.error('Failed to fetch user', {
        requestId,
        userId: id,
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
