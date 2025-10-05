// External Dependencies
import { z } from 'zod';

/**
 * Schema for validating login credentials.
 *
 * This schema validates the following fields:
 * - `email`: A required string that must be in a valid email format.
 *   - Trims whitespace and converts the value to lowercase.
 *   - Throws an error if the email is missing or not a string.
 *   - Error messages:
 *     - "Email address is required" if the email is not provided.
 *     - "Email must be a string" if the email is not a string.
 *     - "Invalid email format" if the email is not in a valid format.
 * - `password`: A required string.
 *   - Throws an error if the password is missing or not a string.
 *   - Error messages:
 *     - "Password is required" if the password is not provided.
 *     - "Password must be a string" if the password is not a string.
 */
export const loginSchema = z.object({
  email: z
    .string({
      error: (issue) =>
        issue.input === undefined ? 'Email address is required' : 'Email must be a string',
    })
    .trim()
    .toLowerCase()
    .pipe(
      z.email({
        message: 'Invalid email format',
      })
    ),
  password: z.string({
    error: (issue) =>
      issue.input === undefined ? 'Password is required' : 'Password must be a string',
  }),
});

// Type inference from the schema for compile-time safety
export type LoginSchema = z.infer<typeof loginSchema>;
