// Shared Modules
import { HTTP_STATUS_CODE } from '#shared/constants/http-status-codes.js';
import createMetricsCollector from '#shared/utils/metrics-collector.js';

// Utilities
import { log } from '#utils/observability/logger.js';

// Parent Directory Imports
import { deleteUserByIdService } from '../services/delete-user-by-id.service.js';

// Type Imports
import type { Request, Response } from 'express';

/**
 * Controller for handling user deletion by ID.
 *
 * This controller provides an endpoint to delete a specific user from the system.
 * It includes structured logging, error handling, and performance metrics.
 *
 * @remarks
 * - The function uses nullish coalescing to ensure a valid request ID is generated.
 * - Performance metrics are captured using high-precision timestamps.
 * - Errors are logged with detailed context for debugging purposes.
 *
 * @complexity
 * - O(1) for generating request ID and capturing timestamps.
 * - O(1) for deleting user by ID using indexed deletion.
 *
 * @example
 * ```typescript
 * import { deleteUserController } from './controllers/delete-user.controller';
 *
 * app.delete('/users/:id', deleteUserController.deleteUser);
 * ```
 *
 * @throws
 * - Responds with a 404 status code if the user is not found.
 * - Responds with a 400 status code if the request contains invalid data.
 * - Responds with a 500 status code if an error occurs during user deletion.
 *
 * @logs
 * - Logs the start and end of the operation with execution time.
 * - Logs errors with detailed context for debugging purposes.
 */
export const deleteUserByIdController = {
  /**
   * Deletes a specific user by ID from the system
   *
   * @param req - Express request object containing user ID parameter
   * @param res - Express response object
   * @returns Promise<void> - Resolves when response is sent
   *
   * O(1) complexity using indexed database deletion
   */
  deleteUserById: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const requestId = (req.headers['x-request-id'] as string | undefined) ?? crypto.randomUUID();

    // O(1) metrics collection for performance monitoring
    const collector = createMetricsCollector();
    const stopTimer = collector.startTimer();

    try {
      log.info('Deleting user by ID', {
        requestId,
        userId: id,
        endpoint: `DELETE /users/${id}`,
        controller: 'deleteUserByIdController.deleteUserById',
      });

      // O(1) service call with business logic
      const result = await deleteUserByIdService.deleteUserById(id);

      // O(1) timing completion
      stopTimer();
      const queryTime = collector.getMetric();

      if (!result.success) {
        log.error('Failed to delete user', {
          requestId,
          userId: id,
          error: result.error,
          queryTime: collector.getMetric(),
        });

        // O(1) error response formatting
        res.status(HTTP_STATUS_CODE.NOT_FOUND).json(
          Object.freeze({
            success: false,
            message: 'USER_DELETE_FAILED',
            error: result.error,
            queryTime: queryTime,
          })
        );
        return;
      }

      log.info('User deleted successfully', {
        requestId,
        userId: id,
        queryTime: collector.getMetric(),
      });

      // O(1) success response formatting
      res.status(HTTP_STATUS_CODE.OK).json(
        Object.freeze({
          success: true,
          message: 'USER_DELETED_SUCCESSFULLY',
          data: result.data,
          queryTime: queryTime,
        })
      );
    } catch {
      // Stop timer even on unexpected errors
      stopTimer();

      log.error('Failed to delete user', {
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
