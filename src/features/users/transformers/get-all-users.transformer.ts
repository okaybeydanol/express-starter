// Type Imports
import type { UserResponse } from '../types/get-all-users.types.js';
import type { User } from '@prisma/client';

/**
 * Transforms a `User` object into a `UserResponse` object.
 *
 * @param user - The `User` object to be transformed.
 * @returns A `UserResponse` object containing the user's details.
 */
export const getAllUsersResponse = (user: User): UserResponse => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
