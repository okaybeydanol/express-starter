// Shared Modules
import { comparePassword } from '#shared/utils/password-hashing';

// Parent Directory Imports
import { generateAccessToken, generateRefreshToken } from '../../../shared/utils/token.utils.js';
import { authRepository } from '../repositories/auth.repostory.js';
import { loginSchema } from '../schemas/login.schema.js';

// Type Imports
import type { LoginRequest, LoginResult } from '../types/auth.types.js';

/**
 * Service for handling user login and authentication.
 *
 * @remarks
 * This service provides a method to authenticate users using their email and password.
 * It validates the input, checks the user's existence, verifies the password, and generates
 * JWT tokens upon successful authentication.
 *
 * @example
 * ```typescript
 * const credentials = { email: 'user@example.com', password: 'securePassword123' };
 * const result = await loginService.login(credentials);
 * if (result.success) {
 *   console.log('Access Token:', result.token);
 *   console.log('Refresh Token:', result.refreshToken);
 * } else {
 *   console.error('Login failed:', result.error);
 * }
 * ```
 *
 * @module loginService
 */
export const loginService = {
  /**
   * Authenticates a user based on the provided credentials.
   *
   * @param credentials - An immutable object containing the user's login information.
   * @returns A promise that resolves to a `LoginResult` object indicating the success or failure of the login attempt.
   *
   * The function performs the following steps:
   * 1. Validates the input credentials using a Zod schema.
   * 2. Checks if a user with the provided email exists in the repository.
   * 3. Verifies the provided password against the stored hashed password.
   * 4. Generates an access token and a refresh token for the authenticated user.
   * 5. Returns an immutable response object containing the authentication result.
   *
   * Error handling:
   * - If validation fails, an error message is returned.
   * - If the user is not found or the password is incorrect, appropriate error messages are returned.
   * - If an unexpected error occurs, a generic "Authentication failed" error is returned.
   */
  login: async (credentials: Readonly<LoginRequest>): Promise<LoginResult> => {
    try {
      // O(n) input validation using zod schema
      const validationResult = loginSchema.safeParse(credentials);

      if (!validationResult.success) {
        return {
          success: false,
          error: validationResult.error.errors.map((e) => e.message).join(', '),
        };
      }

      // O(1) email uniqueness check
      const user = await authRepository.findByEmail(validationResult.data.email);
      if (user == null) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // This is cryptographically necessary and can't be optimized further
      const passwordValid = await comparePassword(credentials.password, user.password);
      if (!passwordValid) {
        return {
          success: false,
          error: 'Current password is incorrect',
        };
      }

      // Generate tokens - O(1) operations
      const token = generateAccessToken({
        id: user.id,
        email: user.email,
        isActive: user.isActive,
      });

      const refreshToken = generateRefreshToken(user.id);

      // O(1) successful response with immutable object
      return Object.freeze({
        success: true,
        token,
        data: {
          id: user.id,
          email: user.email,
        },
        refreshToken,
      });
    } catch {
      // O(1) error handling with immutable response
      return Object.freeze({
        success: false,
        error: 'Authentication failed',
      });
    }
  },
};
