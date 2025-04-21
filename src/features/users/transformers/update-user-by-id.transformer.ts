// Type Imports
import type { UpdateUserByIdResponse } from '../types/update-user-by-id.types.js';
import type { Role, User } from '@prisma/client';

/**
 * Transforms a `User` object into an `UpdateUserResponse` object.
 *
 * This transformer function takes a User entity from the database and
 * converts it to the format expected in API responses after update operations.
 * It excludes sensitive information like passwords.
 *
 * @param user - The `User` entity from the database
 * @returns An immutable `UpdateUserResponse` object with selected user fields
 *
 * O(1) complexity for simple property mapping
 */
export const updateUserByIdResponse = (
  user: Partial<User> & {
    readonly id: string;
    readonly email: string;
    readonly isActive: boolean;
    readonly role: Role;
    readonly updatedAt: Date;
  }
): UpdateUserByIdResponse =>
  Object.freeze({
    id: user.id,
    email: user.email,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    isActive: user.isActive,
    role: user.role,
    updatedAt: user.updatedAt,
  });
