// Shared Modules
import { HTTP_STATUS_CODE } from '#shared/constants/http-status-codes.js';

// Parent Directory Imports
import { tokenInvalidationService } from '../../../shared/services/token-invalidation.service.js';
import { extractTokenFromHeader } from '../../../shared/utils/token.utils.js';

// Type Imports
import type { AuthenticatedRequest } from '../../../shared/middleware/jwt.middleware.js';
import type { Request, Response } from 'express';

/**
 * Controller for handling user logout functionality.
 *
 * This controller provides a method to handle user logout by invalidating
 * the current authentication token associated with the user. It ensures
 * that the token is no longer valid for future requests.
 *
 * @property logout - Asynchronous method to handle the logout process.
 *
 * The `logout` method performs the following steps:
 * 1. Extracts the token from the request's authorization header.
 * 2. Validates the presence of the token.
 * 3. Calls the token invalidation service to invalidate the token.
 * 4. Sends an appropriate HTTP response based on the success or failure
 *    of the token invalidation process.
 *
 * @example
 * // Example usage in an Express route
 * router.post('/logout', logoutController.logout);
 */
export const logoutController = {
  /**
   * Handles user logout by invalidating the current token
   *
   * @param req - Express request with authenticated user
   * @param res - Express response
   *
   * O(1) operation for token invalidation
   */
  logout: async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token === null || token === '') {
      res.status(HTTP_STATUS_CODE.BAD_REQUEST).json(
        Object.freeze({
          success: false,
          message: 'LOGOUT_FAILED',
          error: 'No token provided',
        })
      );
      return;
    }

    const result = await tokenInvalidationService.invalidateToken(token, userId);

    if (!result.success) {
      res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json(
        Object.freeze({
          success: false,
          message: 'LOGOUT_FAILED',
          error: 'Failed to invalidate token',
        })
      );
      return;
    }

    res.status(HTTP_STATUS_CODE.OK).json(
      Object.freeze({
        success: true,
        message: 'LOGOUT_SUCCESS',
      })
    );
  },
};
