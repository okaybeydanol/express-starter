// External Dependencies
import { z } from 'zod';

export const getUserByIdSchema = z.object({
  id: z
    .any()
    .refine((val) => val !== undefined, { message: 'User ID is required' })
    .refine((val) => typeof val === 'string', { message: 'User ID must be a string' })
    .pipe(z.uuid({ message: 'Invalid UUID format for user ID' })),
});

// Type inference from the schema for compile-time safety
export type CreateUserSchema = z.infer<typeof getUserByIdSchema>;
