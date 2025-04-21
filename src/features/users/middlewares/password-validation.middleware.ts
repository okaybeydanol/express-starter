// External Dependencies
import crypto from 'node:crypto';

// Shared Modules
import { HTTP_STATUS_CODE } from '#shared/constants/http-status-codes.js';

// Parent Directory Imports
import { getTypedProperty } from '../utils/access-property.js';

// Type Imports
import type { Request, Response, NextFunction } from 'express';

/**
 * Middleware for validating password confirmation matches
 *
 * @param passwordField - Name of the password field
 * @param confirmField - Name of the confirmation field
 * @returns Express middleware function
 *
 * O(n) comparison complexity where n is password length
 */

export const validatePasswordMatchMiddleware =
  <T extends Record<string, unknown>>(passwordField: keyof T, confirmField: keyof T) =>
  (req: Request & { readonly body: T }, res: Response, next: NextFunction): void => {
    const requestId = (req.headers['x-request-id'] as string | undefined) ?? crypto.randomUUID();

    // Safe type checking before accessing dynamic property - O(1) operation
    if (typeof req.body !== 'object') {
      res.status(HTTP_STATUS_CODE.BAD_REQUEST).json(
        Object.freeze({
          success: false,
          message: 'VALIDATION_ERROR',
          error: 'Request body is missing or invalid',
          requestId,
        })
      );
      return;
    }

    // Type safe property access with explicit casting for V8 optimization
    const password = getTypedProperty(req.body, passwordField) as string;
    const confirmPassword = getTypedProperty(req.body, confirmField) as string;

    // Type safety checks - O(1) operations
    if (typeof password !== 'string' || typeof confirmPassword !== 'string') {
      res.status(HTTP_STATUS_CODE.BAD_REQUEST).json(
        Object.freeze({
          success: false,
          message: 'VALIDATION_ERROR',
          error: 'Password and confirmation must be strings',
          requestId,
        })
      );
      return;
    }

    // O(n) TIMING-SAFE string comparison using crypto.timingSafeEqual
    try {
      // Convert strings to buffers of equal length
      const passwordBuffer = Buffer.from(password);
      const confirmBuffer = Buffer.from(confirmPassword);

      const areEqual =
        passwordBuffer.length === confirmBuffer.length &&
        crypto.timingSafeEqual(passwordBuffer, confirmBuffer);

      if (!areEqual) {
        res.status(HTTP_STATUS_CODE.BAD_REQUEST).json(
          Object.freeze({
            success: false,
            message: 'VALIDATION_ERROR',
            error: 'Passwords do not match',
            requestId,
          })
        );
        return;
      }

      next();
    } catch {
      // Handle unexpected errors with proper logging
      res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json(
        Object.freeze({
          success: false,
          message: 'SERVER_ERROR',
          error: 'Failed to validate passwords',
          requestId,
        })
      );
    }
  };
