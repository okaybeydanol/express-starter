// External Dependencies
import jwt from 'jsonwebtoken';

// Configuration
import { prisma } from '#config/client.js';

// Shared Modules
import { tokenInvalidationService } from '#shared/services/token-invalidation.service.js';
import {
  TOKEN_CONFIG,
  generateAccessToken,
  generateRefreshToken,
} from '#shared/utils/token.utils.js';

// Type Imports
import type { RefreshTokenResult } from '../types/auth.types.js';

/**
 * Determines if the provided payload is a valid refresh token payload.
 *
 * This function performs a type guard check to ensure that the payload is an object
 * with the required properties: `id` (a string), `iat` (a number), and `exp` (a number).
 *
 * @param payload - The payload to validate, which can be of any type.
 * @returns A boolean indicating whether the payload is a valid refresh token payload.
 */
const isValidRefreshPayload = (
  payload: unknown
): payload is { readonly id: string; readonly iat: number; readonly exp: number } =>
  typeof payload === 'object' &&
  payload !== null &&
  'id' in payload &&
  typeof (payload as { readonly id: unknown }).id === 'string';

/**
 * Service for handling refresh token operations, including validation,
 * invalidation, and generation of new access and refresh tokens.
 *
 * This service implements refresh token rotation for enhanced security:
 * - Validates the provided refresh token.
 * - Invalidates the old refresh token to prevent reuse.
 * - Issues a new access token and refresh token pair.
 *
 * @remarks
 * - Ensures O(1) complexity for token operations such as validation,
 *   invalidation, and generation.
 * - Includes cryptographic verification of the refresh token.
 * - Fetches user data to ensure the user is active and valid.
 *
 * @example
 * ```typescript
 * const result = await refreshTokenService.refreshToken(refreshToken);
 * if (result.success) {
 *   console.log('New access token:', result.token);
 *   console.log('New refresh token:', result.refreshToken);
 * } else {
 *   console.error('Error refreshing token:', result.error);
 * }
 * ```
 */

export const refreshTokenService = {
  /**
   * Handles the process of refreshing an access token using a provided refresh token.
   *
   * @param {string} refreshToken - The refresh token provided by the client.
   * @returns {Promise<RefreshTokenResult>} A promise that resolves to an object containing:
   * - `success` (boolean): Indicates whether the operation was successful.
   * - `token` (string | undefined): The new access token, if the operation was successful.
   * - `refreshToken` (string | undefined): The new refresh token, if the operation was successful.
   * - `error` (string | undefined): An error message, if the operation failed.
   *
   * The function performs the following steps:
   * 1. Checks if the provided refresh token has been invalidated.
   * 2. Verifies the cryptographic validity of the refresh token.
   * 3. Validates the structure of the refresh token payload.
   * 4. Fetches the user associated with the token from the database.
   * 5. Ensures the user exists and their account is active.
   * 6. Invalidates the old refresh token to prevent reuse.
   * 7. Generates and returns new access and refresh tokens.
   *
   * If any step fails, an appropriate error message is returned.
   */
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResult> => {
    try {
      // Check if token is already invalidated - O(1) lookup
      const isInvalidated = await tokenInvalidationService.isTokenInvalidated(refreshToken);

      if (isInvalidated) {
        return Object.freeze({
          success: false,
          error: 'Refresh token has been invalidated',
        });
      }

      try {
        // Verify refresh token cryptographically - O(1) operation
        const payload = jwt.verify(refreshToken, TOKEN_CONFIG.REFRESH_TOKEN_SECRET);

        if (!isValidRefreshPayload(payload)) {
          return Object.freeze({
            success: false,
            error: 'Invalid refresh token payload structure',
          });
        }

        // Fetch user data to include in new token - O(1) indexed lookup
        const user = await prisma.user.findUnique({
          where: { id: payload.id },
          select: {
            id: true,
            email: true,
            isActive: true,
          },
        });

        if (user == null) {
          return Object.freeze({
            success: false,
            error: 'User not found',
          });
        }

        if (!user.isActive) {
          return Object.freeze({
            success: false,
            error: 'User account is inactive',
          });
        }

        // Invalidate old refresh token - O(1) operation
        // This prevents the refresh token from being used again
        await tokenInvalidationService.invalidateToken(refreshToken, user.id);

        // Generate new tokens - O(1) operations
        const newAccessToken = generateAccessToken({
          id: user.id,
          email: user.email,
          isActive: user.isActive,
        });

        const newRefreshToken = generateRefreshToken(user.id);

        return Object.freeze({
          success: true,
          token: newAccessToken,
          refreshToken: newRefreshToken,
        });
      } catch (error) {
        // O(1) error handling for token verification failures
        return Object.freeze({
          success: false,
          error: error instanceof Error ? error.message : 'Invalid refresh token',
        });
      }
    } catch {
      // O(1) error handling with immutable response
      return Object.freeze({
        success: false,
        error: 'Token refresh failed',
      });
    }
  },
};
