// External Dependencies
import { z } from 'zod';

export const getUserByIdSchema = z.object({
  id: z
    .string({
      required_error: 'User ID is required',
      invalid_type_error: 'User ID must be a string',
    })
    .uuid({
      message: 'Invalid UUID format for user ID',
    }),
});

// Type inference from the schema for compile-time safety
export type CreateUserSchema = z.infer<typeof getUserByIdSchema>;
