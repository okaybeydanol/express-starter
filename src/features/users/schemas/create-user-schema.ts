// External Dependencies
import { z } from 'zod';

// Parent Directory Imports
import { PASSWORD_SCHEMA } from '../constant/create-user.constant.js';

// Sibling Directory Imports
import { passwordSchema } from './password.schema.js';

/**
 * Schema for validating user creation input using Zod.
 *
 * This schema validates the following fields:
 *
 * - `email`: A required string that must be a valid email address.
 *   - Errors:
 *     - Required: "Email address is required"
 *     - Invalid type: "Email must be a string"
 *     - Invalid format: "Invalid email format"
 *   - The email is trimmed and converted to lowercase.
 *
 * - `password`: A required field validated by the `passwordSchema`.
 *
 * - `firstName`: An optional string representing the user's first name.
 *   - Must be at least 2 characters long.
 *   - Cannot exceed the maximum length defined in `PASSWORD_SCHEMA.NAME_MAX_LENGTH`.
 *   - Errors:
 *     - Invalid type: "First name must be a string"
 *     - Too short: "First name must be at least 2 characters long"
 *     - Too long: "First name cannot exceed {PASSWORD_SCHEMA.NAME_MAX_LENGTH} characters"
 *   - The value is trimmed and can be null or undefined.
 *
 * - `lastName`: An optional string representing the user's last name.
 *   - Must be at least 2 characters long.
 *   - Cannot exceed the maximum length defined in `PASSWORD_SCHEMA.NAME_MAX_LENGTH`.
 *   - Errors:
 *     - Invalid type: "Last name must be a string"
 *     - Too short: "Last name must be at least 2 characters long"
 *     - Too long: "Last name cannot exceed {PASSWORD_SCHEMA.NAME_MAX_LENGTH} characters"
 *   - The value is trimmed and can be null or undefined.
 */
export const createUserSchema = z.object({
  email: z
    .string({
      required_error: 'Email address is required',
      invalid_type_error: 'Email must be a string',
    })
    .email({
      message: 'Invalid email format',
    })
    .trim()
    .toLowerCase(),
  password: passwordSchema,
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
});

// Type inference from the schema for compile-time safety
export type CreateUserSchema = z.infer<typeof createUserSchema>;
