// Type Imports
import type { CreateUserResponse } from '../types/create-user.types.js';
import type { User } from '@prisma/client';

/**
 * Transforms a `User` object into a `UserResponse` object.
 *
 * @param user - The `User` object to be transformed.
 * @returns A `UserResponse` object containing the user's details.
 */
export const newUserResponse = (user: User): CreateUserResponse => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
