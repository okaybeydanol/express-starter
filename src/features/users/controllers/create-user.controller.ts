// Shared Modules
import { HTTP_STATUS_CODE } from '#shared/constants/http-status-codes.js';
import createMetricsCollector from '#shared/utils/metrics-collector.js';

// Utilities
import log from '#utils/observability/logger.js';

// Parent Directory Imports
import { createUserService } from '../services/create-user.service.js';

// Type Imports
import type { TypedRequestBody } from '#shared/types/express.js';
import type { CreateUserInput } from '../types/create-user.types.js';
import type { Response } from 'express';

/**
 * Controller for handling user creation requests.
 *
 * This controller provides a method to handle HTTP POST requests for creating
 * a new user. It includes input validation, business logic execution, and
 * response formatting for both success and error scenarios.
 *
 * @remarks
 * - The method uses a metrics collector to measure the performance of the operation.
 * - Logs are generated for both successful and failed operations.
 * - Error responses are designed to minimize information leakage.
 *
 * @example
 * ```typescript
 * import { createUserController } from './create-user.controller';
 *
 * app.post('/user/create', createUserController.createUser);
 * ```
 *
 * @public
 */
export const createUserController = {
  /**
   * Handles HTTP POST request to create a new user
   *
   * @param req - Express request object with user input
   * @param res - Express response object
   * @returns Promise<void> as the response is handled directly
   *
   * O(n) complexity where n depends on validation and DB operations
   */
  createUser: async (req: TypedRequestBody<CreateUserInput>, res: Response): Promise<void> => {
    const requestId = (req.headers['x-request-id'] as string | undefined) ?? crypto.randomUUID();

    // O(1) metrics collection for performance monitoring
    const collector = createMetricsCollector();
    const stopTimer = collector.startTimer();

    try {
      log.info('Create user', {
        requestId,
        endpoint: 'POST /user/create',
        controller: 'createUserController.createUser',
      });

      // O(n) service call with business logic
      const result = await createUserService.createUser(req.body);

      // O(1) timing completion
      stopTimer();
      const queryTime = collector.getMetric();

      if (!result.success) {
        log.error('User creation failed', {
          requestId,
          error: result.error,
          queryTime: collector.getMetric(),
        });

        // O(1) error response formatting
        res.status(HTTP_STATUS_CODE.BAD_REQUEST).json(
          Object.freeze({
            success: false,
            message: 'USER_CREATION_FAILED',
            error: result.error,
            queryTime: queryTime,
          })
        );
        return;
      }

      log.info('User created successfully', {
        requestId,
        queryTime: collector.getMetric(),
      });

      // O(1) success response formatting
      res.status(HTTP_STATUS_CODE.CREATED).json(
        Object.freeze({
          success: true,
          message: 'USER_CREATED_SUCCESSFULLY',
          data: result.data,
          queryTime: queryTime,
        })
      );
    } catch {
      // Stop timer even on unexpected errors
      stopTimer();

      log.error('User creation failed', {
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
