// Node.js Core Modules
import { performance } from 'node:perf_hooks';

// Configuration
import { env } from '#config/env.js';

// Shared Modules
import { HTTP_STATUS_CODE } from '#shared/constants/http-status-codes.js';

// Utilities
import { log } from '#utils/observability/logger.js';

// Parent Directory Imports
import { getAllUsersService } from '../services/get-all-users.service.js';

// Type Imports
import type { UsersApiResponse } from '../types/get-all-users.types.js';
import type { Response, Request } from 'express';

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
 * @param _req - The Express request object (unused in this controller).
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
   * @param _req - Express request object (unused)
   * @param res - Express response object
   * @returns Promise<void> - Resolves when response is sent
   *
   * O(n) complexity where n is the number of users
   */
  getAllUsers: async (_req: Request, res: Response<UsersApiResponse>): Promise<void> => {
    // Use nullish coalescing for proper null/undefined check with O(1) complexity
    const requestId = (_req.headers['x-request-id'] as string | undefined) ?? crypto.randomUUID();
    const startTime = performance.now(); // O(1) high-precision timestamp for metrics

    try {
      log.info('Fetching all users', {
        requestId,
        endpoint: 'GET /users',
        controller: 'userController.getAllUsers',
      });

      // Service call with O(n) complexity
      const users = await getAllUsersService.getAllUsers();
      const executionTime = performance.now() - startTime; // Calculate execution time with O(1)

      log.info('Users fetched successfully', {
        requestId,
        count: users.length,
        executionTimeMs: Math.floor(executionTime), // Round to integer for cleaner logs
      });

      // Successful response with O(1) status code lookup
      res.status(HTTP_STATUS_CODE.OK).json({
        success: true,
        data: users,
        count: users.length,
      });
    } catch (error) {
      // Structured error logging with O(1) property access pattern
      const errorObj = error instanceof Error ? error : new Error(String(error));
      const executionTime = performance.now() - startTime; // Calculate execution time even for errors

      log.error('Failed to fetch users', {
        requestId,
        endpoint: 'GET /users',
        errorName: errorObj.name,
        errorMessage: errorObj.message,
        stackTrace: env.isProduction ? undefined : errorObj.stack,
        // Additional context for debugging
        timestamp: new Date().toISOString(),
        nodeEnv: env.nodeEnv,
        executionTimeMs: Math.floor(executionTime),
      });

      // Error response with O(1) status code lookup
      res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
        success: false,
        data: [],
        count: 0,
        error: env.isProduction
          ? 'Internal server error'
          : `Failed to fetch users: ${errorObj.message}`,
      });
    }
  },
};
