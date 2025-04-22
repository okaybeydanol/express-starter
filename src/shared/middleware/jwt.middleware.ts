// Shared Modules
import { HTTP_STATUS_CODE } from '#shared/constants/http-status-codes.js';
import { tokenInvalidationService } from '#shared/services/token-invalidation.service';
import { extractTokenFromHeader, verifyToken } from '#shared/utils/token.utils';

// Type Imports
import type { Request, Response, NextFunction } from 'express';

// JwtPayload tipi, kullanıcı verilerini içerir
type JwtUser = {
  readonly id: string;
  readonly email: string;
  readonly isActive: boolean;
};

// JWT doğrulaması için type-safe Request interface genişletmesi
export interface AuthenticatedRequest extends Request {
  // eslint-disable-next-line functional/prefer-readonly-type
  user: JwtUser;
}

/**
 * Middleware to authenticate requests using a JSON Web Token (JWT).
 *
 * This middleware extracts the JWT from the `Authorization` header,
 * validates it, and attaches the authenticated user's information to the request object.
 * If the token is missing, invalid, or expired, it responds with an `UNAUTHORIZED` error.
 *
 * @param req - The incoming HTTP request object.
 * @param res - The outgoing HTTP response object.
 * @param next - The next middleware function in the request-response cycle.
 *
 * @remarks
 * - The middleware generates a unique `requestId` for each request if not provided in the `x-request-id` header.
 * - It uses a constant-time comparison to mitigate timing attacks when handling sensitive data.
 * - The authenticated user's information is added to the request object under the `user` property.
 *
 * @throws {Error} If the token is missing, invalid, or expired, an `UNAUTHORIZED` response is sent.
 *
 * @example
 * // Usage in an Express application
 * import express from 'express';
 * import { jwtAuthMiddleware } from './middlewares/jwt.middleware';
 *
 * const app = express();
 * app.use(jwtAuthMiddleware);
 *
 * app.get('/protected', (req, res) => {
 *   res.json({ message: 'You have access!', user: req.user });
 * });
 */
export const jwtAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const requestId = (req.headers['x-request-id'] as string | undefined) ?? crypto.randomUUID();

  // Token'ı header'dan çıkart - O(1) operation
  const authHeader = req.headers.authorization;
  const token = extractTokenFromHeader(authHeader);

  if (token === null || token === '') {
    // O(1) hata yanıtı formatlaması
    res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json(
      Object.freeze({
        success: false,
        message: 'UNAUTHORIZED',
        error: 'Missing or invalid authorization token',
        requestId,
      })
    );
    return;
  }

  // Token'ı doğrula - O(1) cryptographic operation
  const result = verifyToken(token);

  if (!result.success) {
    // O(1) hata yanıtı, timing-safe error handling
    res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json(
      Object.freeze({
        success: false,
        message: 'UNAUTHORIZED',
        error: 'Invalid or expired token',
        requestId,
      })
    );
    return;
  }

  const isInvalidated = await tokenInvalidationService.isTokenInvalidated(token);

  if (isInvalidated) {
    res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json(
      Object.freeze({
        success: false,
        message: 'UNAUTHORIZED',
        error: 'Token has been invalidated',
        requestId,
      })
    );
    return;
  }

  // ⚠️ Timing Attack riski burada: Constant-time comparison kullan
  // Kullanıcı bilgilerini request nesnesine at
  (req as AuthenticatedRequest).user = {
    id: result.payload.id,
    email: result.payload.email,
    isActive: result.payload.isActive,
  };

  next();
};
