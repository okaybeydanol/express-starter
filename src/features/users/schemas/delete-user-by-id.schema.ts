// External Dependencies
import { z } from 'zod';

/**
 * Zod schema for validating the input required to delete a user by ID.
 *
 * This schema expects an object with a single property:
 * - `id`: Must be defined, must be a string, and must be a valid UUID.
 *
 * Validation errors:
 * - If `id` is undefined, returns "User ID is required".
 * - If `id` is not a string, returns "User ID must be a string".
 * - If `id` is not a valid UUID, returns "Invalid UUID format for user ID".
 */
export const deleteUserByIdSchema = z.object({
  id: z
    .any()
    .refine((val) => val !== undefined, { message: 'User ID is required' })
    .refine((val) => typeof val === 'string', { message: 'User ID must be a string' })
    .pipe(z.uuid({ message: 'Invalid UUID format for user ID' })),
});

// Type inference from the schema for compile-time safety
export type DeleteUserSchema = z.infer<typeof deleteUserByIdSchema>;
