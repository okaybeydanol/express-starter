// External Dependencies
import jwt from 'jsonwebtoken';

// Configuration
import { env } from '#config/env';

// Type Imports
import type { JwtPayload, VerifyTokenResult } from './jwt.types.js';

/**
 * A frozen configuration object for token-related settings.
 *
 * @constant
 * @property {string} JWT_SECRET - The secret key used for signing JSON Web Tokens (JWT).
 * @property {jwt.SignOptions['expiresIn']} JWT_EXPIRES_IN - The expiration time for JWTs.
 * @property {string} REFRESH_TOKEN_SECRET - The secret key used for signing refresh tokens.
 * @property {jwt.SignOptions['expiresIn']} REFRESH_TOKEN_EXPIRES_IN - The expiration time for refresh tokens.
 * @property {'HS256'} ALGORITHM - The algorithm used for signing tokens, set to 'HS256'.
 */
export const TOKEN_CONFIG = Object.freeze({
  JWT_SECRET: env.jwt.secret,
  JWT_EXPIRES_IN: env.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  REFRESH_TOKEN_SECRET: env.jwt.refreshSecret,
  REFRESH_TOKEN_EXPIRES_IN: env.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
  ALGORITHM: 'HS256' as const,
});

/**
 * Generates a JWT access token from user data with cryptographic signing.
 *
 * @param payload - User data to encode in the token
 * @returns A signed JWT token string
 *
 * O(n) complexity where n is the size of the payload
 */
export const generateAccessToken = (payload: Readonly<Omit<JwtPayload, 'exp' | 'iat'>>): string => {
  const expiresIn = TOKEN_CONFIG.JWT_EXPIRES_IN ?? '15m';

  const options: jwt.SignOptions = {
    expiresIn,
    algorithm: TOKEN_CONFIG.ALGORITHM,
  };

  return jwt.sign(payload, TOKEN_CONFIG.JWT_SECRET, options);
};

/**
 * Generates a long-lived refresh token for token renewal flows.
 *
 * @param userId - The user's unique identifier
 * @returns A signed refresh token string
 *
 * O(1) complexity for fixed-size payload
 */
export const generateRefreshToken = (userId: string): string => {
  const expiresIn = TOKEN_CONFIG.REFRESH_TOKEN_EXPIRES_IN ?? '7d';

  const options: jwt.SignOptions = {
    expiresIn,
    algorithm: TOKEN_CONFIG.ALGORITHM,
  };

  return jwt.sign({ id: userId }, TOKEN_CONFIG.REFRESH_TOKEN_SECRET, options);
};

/**
 * Verifies and decodes a JWT token with cryptographic signature validation.
 *
 * @param token - The JWT token to verify
 * @returns A result object with either the decoded payload or an error
 *
 * O(1) complexity for token validation
 */
export const verifyToken = (token: string): VerifyTokenResult => {
  try {
    const payload = jwt.verify(token, TOKEN_CONFIG.JWT_SECRET) as JwtPayload;

    // O(1) validation of required payload properties
    if (payload.id.length === 0 || payload.email.length === 0) {
      return {
        success: false,
        error: 'Invalid token payload structure',
      };
    }

    return {
      success: true,
      payload,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid token',
    };
  }
};

/**
 * Extracts the token from various authorization header formats.
 *
 * @param authHeader - The Authorization header value
 * @returns The extracted token or null if not found/valid
 *
 * O(1) complexity for string parsing
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  // O(1) early return for missing header
  if (authHeader == null) {
    return null;
  }

  // Handle "Bearer <token>" format - O(1) string operations
  const parts = authHeader.split(' ');

  if (parts.length === 2) {
    const [authType, token] = parts;

    // V8-optimized string comparison with explicit type check
    if (typeof authType === 'string' && authType.toLowerCase() === 'bearer') {
      // Explicit null check for token
      return token ?? null;
    }
  }

  // If it's just a raw token - O(1) validation
  if (parts.length === 1) {
    const [token] = parts;
    // Explicit null check with length validation
    return token != null && token.length > 0 ? token : null;
  }

  return null;
};
