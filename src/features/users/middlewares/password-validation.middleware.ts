// External Dependencies
import crypto from 'node:crypto';

// Shared Modules
import { HTTP_STATUS_CODE } from '#shared/constants/http-status-codes.js';
import createMetricsCollector from '#shared/utils/metrics-collector.js';

// Parent Directory Imports
import { validatePassword } from '../schemas/password.schema.js';

// Type Imports
import type { TypedRequestBody } from '#shared/types/express.js';
import type { CreateUserInput } from '../types/create-user.types.js';
import type { PasswordField } from '../types/password.types.js';
import type { Response, NextFunction } from 'express';

/**
 * Middleware for validating passwords in request body
 *
 * @param field - The name of the password field in the request body
 * @returns Express middleware function
 *
 * O(n) validation complexity where n is password length
 */
export const createPasswordValidationMiddleware =
  <T extends string>(field: T) =>
  (req: TypedRequestBody<PasswordField>, res: Response, next: NextFunction): void => {
    // Generate request ID for tracing with O(1) complexity
    const requestId = (req.headers['x-request-id'] as string | undefined) ?? crypto.randomUUID();
    const metricsCollector = createMetricsCollector();
    const stopTimer = metricsCollector.startTimer();

    // Type-safe O(1) access to password field with index signature validation
    // This ensures field exists in req.body at compile time
    const password = req.body[field as keyof PasswordField] as string | undefined;

    if (typeof password !== 'string') {
      res.status(HTTP_STATUS_CODE.BAD_REQUEST).json(
        Object.freeze({
          success: false,
          message: 'VALIDATION_ERROR',
          error: `Password field '${field}' must be a string`,
          requestId,
        })
      );
      return;
    }

    // Validate password with O(n) complexity
    const validationResult = validatePassword(password);

    if (!validationResult.success) {
      // Type-safe error handling with proper narrowing
      const errorMessage = validationResult.error ?? 'Unknown password validation error';

      res.status(HTTP_STATUS_CODE.BAD_REQUEST).json(
        Object.freeze({
          success: false,
          message: 'VALIDATION_ERROR',
          error: errorMessage,
          requestId,
        })
      );
      return;
    }

    // Add performance metrics with O(1) complexity
    stopTimer();
    req.metrics = Object.freeze({
      ...req.metrics,
      passwordValidationTime: metricsCollector.getMetric(),
    });

    next();
  };

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
  (passwordField = 'password', confirmField = 'passwordConfirm') =>
  (req: TypedRequestBody<CreateUserInput>, res: Response, next: NextFunction): void => {
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

    // Type safe property access with runtime validation
    const { body } = req;
    const password = body[passwordField as keyof CreateUserInput] as string | undefined;
    const confirmPassword = body[confirmField as keyof CreateUserInput] as string | undefined;

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
