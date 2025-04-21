// Configuration
import { prisma } from '#config/client.js';

// Parent Directory Imports
import { updateUserByIdResponse } from '../transformers/update-user-by-id.transformer.js';

// Type Imports
import type { UpdateUserByIdResponse, UpdateUserParams } from '../types/update-user-by-id.types.js';
import type { User } from '@prisma/client';

/**
 * Repository for user update-related database operations.
 *
 * Provides methods to update user information and retrieve user by ID for verification.
 *
 * Methods:
 * - `updateUser`: Updates an existing user record in the database.
 * - `findUserById`: Retrieves a user by their ID for verification purposes.
 *
 * Complexity:
 * - `updateUser`: O(1) for single record update with proper indexes.
 * - `findUserById`: O(1) lookup using primary key.
 */
export const updateUserByIdRepository = {
  /**
   * Updates an existing user record in the database
   *
   * @param userId - ID of the user to update
   * @param userData - Validated update parameters
   * @returns Updated user from database with all fields
   *
   * O(1) complexity for single record update with proper indexes
   */
  updateUserById: async (
    userId: string,
    userData: Readonly<UpdateUserParams>
  ): Promise<UpdateUserByIdResponse> => {
    // Direct database update with O(1) complexity using primary key
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: userData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        role: true,
        updatedAt: true,
      },
    });

    return updateUserByIdResponse(updatedUser);
  },

  /**
   * Retrieves a user by their ID for verification purposes
   *
   * @param userId - ID of the user to retrieve
   * @returns Full user record if found, null otherwise
   *
   * O(1) lookup using primary key
   */
  findUserById: async (userId: string): Promise<User | null> =>
    await prisma.user.findUnique({
      where: { id: userId },
    }),
};
