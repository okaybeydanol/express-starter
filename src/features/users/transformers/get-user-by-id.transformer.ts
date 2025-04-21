// Type Imports
import type { GetUserByIdResponse } from '../types/get-user-by-id.types.js';
import type { User } from '@prisma/client';

/**
 * Transforms a `User` entity from the database into a `GetUserByIdResponse` object.
 *
 * @param user - The `User` entity to be transformed
 * @returns A `GetUserByIdResponse` object containing the user's details
 *
 * O(1) transformation with minimal property access
 */

export const getUserByIdResponse = (user: User): GetUserByIdResponse =>
  Object.freeze({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
