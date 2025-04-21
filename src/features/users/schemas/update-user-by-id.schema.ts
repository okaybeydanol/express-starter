// External Dependencies
import { z } from 'zod';

// Parent Directory Imports
import { PASSWORD_SCHEMA } from '../constant/create-user.constant.js';

// Sibling Directory Imports
import { passwordSchema } from './password.schema.js';

/**
 * Schema for validating user update input using Zod.
 *
 * This schema validates the following fields:
 *
 * - `currentPassword`: A required field to validate user identity before updates.
 *   - Must be a string.
 *
 * - `newPassword`: An optional field validated by the `passwordSchema` if provided.
 *   - If present, must meet all password requirements.
 *
 * - `newPasswordConfirm`: Required if newPassword is provided.
 *   - Will be checked for equality with newPassword in middleware.
 *
 * - `firstName`: An optional string representing the user's first name.
 *   - Must be at least 2 characters long if provided.
 *   - Cannot exceed the maximum length defined in `PASSWORD_SCHEMA.NAME_MAX_LENGTH`.
 *   - The value is trimmed and can be null.
 *
 * - `lastName`: An optional string representing the user's last name.
 *   - Must be at least 2 characters long if provided.
 *   - Cannot exceed the maximum length defined in `PASSWORD_SCHEMA.NAME_MAX_LENGTH`.
 *   - The value is trimmed and can be null.
 */
export const updateUserByIdSchema = z
  .object({
    id: z
      .string({
        required_error: 'User ID is required',
        invalid_type_error: 'User ID must be a string',
      })
      .uuid({
        message: 'Invalid UUID format for user ID',
      }),
    currentPassword: z.string({
      required_error: 'Current password is required',
      invalid_type_error: 'Current password must be a string',
    }),
    newPassword: passwordSchema.optional(),
    newPasswordConfirm: z.string().optional(),
    firstName: z
      .string({
        invalid_type_error: 'First name must be a string',
      })
      .min(2, {
        message: 'First name must be at least 2 characters long',
      })
      .max(PASSWORD_SCHEMA.NAME_MAX_LENGTH, {
        message: `First name cannot exceed ${PASSWORD_SCHEMA.NAME_MAX_LENGTH} characters`,
      })
      .trim()
      .nullable()
      .optional(),
    lastName: z
      .string({
        invalid_type_error: 'Last name must be a string',
      })
      .min(2, {
        message: 'Last name must be at least 2 characters long',
      })
      .max(PASSWORD_SCHEMA.NAME_MAX_LENGTH, {
        message: `Last name cannot exceed ${PASSWORD_SCHEMA.NAME_MAX_LENGTH} characters`,
      })
      .trim()
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      // O(1) validation to ensure both newPassword and newPasswordConfirm are provided together
      if (
        (data.newPassword != null && data.newPasswordConfirm == null) ||
        (data.newPassword == null && data.newPasswordConfirm != null)
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Both new password and password confirmation must be provided together',
      path: ['newPassword', 'newPasswordConfirm'],
    }
  );

// Type inference from the schema for compile-time safety
export type UpdateUserSchema = z.infer<typeof updateUserByIdSchema>;
