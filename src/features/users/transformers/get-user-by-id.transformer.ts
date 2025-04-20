// Type Imports
import type { UserResponse } from '../types/get-all-users.types.js';
import type { User } from '@prisma/client';

/**
 * Transforms a `User` entity from the database into a `UserResponse` object.
 *
 * @param user - The `User` entity to be transformed
 * @returns A `UserResponse` object containing the user's details
 *
 * O(1) transformation with minimal property access
 */
export const getUserByIdResponse = (user: User): UserResponse => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
