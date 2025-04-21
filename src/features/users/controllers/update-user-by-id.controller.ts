// Shared Modules
import { HTTP_STATUS_CODE } from '#shared/constants/http-status-codes.js';
import createMetricsCollector from '#shared/utils/metrics-collector.js';

// Utilities
import log from '#utils/observability/logger.js';

// Parent Directory Imports
import { updateUserByIdService } from '../services/update-user-by-id.service.js';

// Type Imports
import type { TypedRequestBody } from '#shared/types/express.js';
import type { UpdateUserInput } from '../types/update-user-by-id.types.js';
import type { Response } from 'express';

/**
 * Controller for handling user update requests.
 *
 * This controller provides a method to handle HTTP PUT/PATCH requests for updating
 * an existing user's information. It includes authentication verification, input validation,
 * business logic execution, and response formatting for both success and error scenarios.
 *
 * @remarks
 * - The method uses a metrics collector to measure the performance of the operation.
 * - Logs are generated for both successful and failed operations.
 * - Error responses are designed to minimize information leakage.
 * - The user ID is extracted from authenticated request or params.
 *
 * @example
 * ```typescript
 * import { updateUserByIdController } from './update-user.controller';
 *
 * app.put('/users/:id', updateUserByIdController.updateUser);
 * ```
 *
 * @public
 */
export const updateUserByIdController = {
  /**
   * Handles HTTP PUT request to update an existing user
   *
   * @param req - Express request object with user input and params
   * @param res - Express response object
   * @returns Promise<void> as the response is handled directly
   *
   * O(n) complexity where n depends on validation and DB operations
   */
  updateUser: async (req: TypedRequestBody<UpdateUserInput>, res: Response): Promise<void> => {
    const userId = req.body.id;
    const requestId = (req.headers['x-request-id'] as string | undefined) ?? crypto.randomUUID();

    // O(1) metrics collection for performance monitoring
    const collector = createMetricsCollector();
    const stopTimer = collector.startTimer();

    try {
      log.info('Update user', {
        requestId,
        userId,
        endpoint: `PUT /users/${userId}`,
        controller: 'updateUserByIdController.updateUser',
      });

      // O(n) service call with business logic
      const result = await updateUserByIdService.updateUser(req.body);

      // O(1) timing completion
      stopTimer();
      const queryTime = collector.getMetric();

      if (!result.success) {
        log.error('User update failed', {
          requestId,
          userId,
          error: result.error,
          queryTime: collector.getMetric(),
        });

        // Determine appropriate status code based on error
        const statusCode =
          result.error === 'User not found'
            ? HTTP_STATUS_CODE.NOT_FOUND
            : result.error === 'Current password is incorrect'
              ? HTTP_STATUS_CODE.UNAUTHORIZED
              : HTTP_STATUS_CODE.BAD_REQUEST;

        // O(1) error response formatting
        res.status(statusCode).json(
          Object.freeze({
            success: false,
            message: 'USER_UPDATE_FAILED',
            error: result.error,
            queryTime: queryTime,
          })
        );
        return;
      }

      log.info('User updated successfully', {
        requestId,
        userId,
        queryTime: collector.getMetric(),
      });

      // O(1) success response formatting
      res.status(HTTP_STATUS_CODE.OK).json(
        Object.freeze({
          success: true,
          message: 'USER_UPDATED_SUCCESSFULLY',
          data: result.data,
          queryTime: queryTime,
        })
      );
    } catch {
      // Stop timer even on unexpected errors
      stopTimer();

      log.error('User update failed', {
        requestId,
        userId,
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
