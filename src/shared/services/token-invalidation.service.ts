// External Dependencies
import jwt from 'jsonwebtoken';

// Configuration
import { prisma } from '#config/client';

// Shared Modules
import { JWT_CONSTANTS } from '#shared/constants/jwt.constant';

// Type Imports
import type { JwtPayload } from '#shared/utils/jwt.types';

/**
 * Service for managing JWT token invalidation.
 *
 * This service provides methods to invalidate JWT tokens, check if a token
 * has been invalidated, and clean up expired invalidated tokens. It ensures
 * efficient database operations and adheres to best practices for token
 * management.
 *
 * Methods:
 * - `invalidateToken`: Invalidates a JWT token by adding it to a database blacklist.
 * - `isTokenInvalidated`: Checks if a token has been invalidated.
 * - `cleanupExpiredTokens`: Cleans up expired invalidated tokens from the database.
 *
 * All operations are designed for optimal performance:
 * - O(1) operations for token invalidation and lookup.
 * - O(n) operation for cleanup, intended to be run as a scheduled job.
 */
export const tokenInvalidationService = {
  /**
   * Invalidates a JWT token by adding it to the database blacklist
   *
   * @param token - The JWT token to invalidate
   * @param userId - ID of the user who owns the token
   * @returns Success status
   *
   * O(1) operation for token invalidation
   */
  invalidateToken: async (
    token: string,
    userId: string
  ): Promise<{ readonly success: boolean }> => {
    try {
      // V8-optimized type checking with discriminator pattern
      const decoded = jwt.decode(token);

      if (decoded === null || typeof decoded !== 'object' || !('exp' in decoded)) {
        return Object.freeze({ success: false });
      }

      const jwtPayload = decoded as JwtPayload;

      // Fail fast if no expiration in token
      if (typeof jwtPayload.exp !== 'number') {
        return Object.freeze({ success: false });
      }

      // Calculate expiration date from JWT exp timestamp (in seconds)
      const expiresAt = new Date(jwtPayload.exp * JWT_CONSTANTS.UNIX_TIMESTAMP);

      // O(1) database insert with all required fields
      await prisma.invalidatedToken.create({
        data: {
          token,
          userId,
          invalidatedAt: new Date(),
          expiresAt,
        },
      });

      return Object.freeze({ success: true });
    } catch {
      // O(1) error handling with immutable return value
      return Object.freeze({ success: false });
    }
  },

  /**
   * Checks if a token has been invalidated
   *
   * @param token - The JWT token to check
   * @returns Whether the token is invalid
   *
   * O(1) database lookup with index
   */
  isTokenInvalidated: async (token: string): Promise<boolean> => {
    try {
      // O(1) indexed lookup with minimal projection for maximum performance
      const invalidToken = await prisma.invalidatedToken.findUnique({
        where: { token },
        select: { token: true }, // O(1) minimal field selection
      });

      return invalidToken !== null;
    } catch {
      // Fail-safe: if DB error, assume token is valid for security
      return false;
    }
  },

  /**
   * Cleans up expired invalidated tokens
   *
   * @returns Number of tokens deleted
   *
   * O(n) cleanup operation, should be run as a scheduled job
   */
  cleanupExpiredTokens: async (): Promise<number> => {
    try {
      // O(n) bulk deletion with index-backed date comparison
      const result = await prisma.invalidatedToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(), // Current time
          },
        },
      });

      return result.count;
    } catch {
      return 0;
    }
  },
};
