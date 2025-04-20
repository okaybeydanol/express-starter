// Configuration
import { prisma } from '#config/client.js';

// Type Imports
import type { User } from '@prisma/client';

/**
 * Repository for deleting a user from the database.
 *
 * @property removeById - Asynchronously deletes a user by their unique ID.
 * The function uses Prisma's O(1) indexed deletion for maximum performance.
 *
 * @returns A promise that resolves to the deleted User object if found and deleted,
 * or null if the user was not found.
 */
export const deleteUserByIdRepository = {
  /**
   * Removes a user by their unique ID
   *
   * @param id - The unique identifier of the user to delete
   * @returns The deleted User object if successful, null otherwise
   *
   * O(1) complexity using primary key deletion
   */
  deleteById: async (id: string): Promise<User | null> =>
    await prisma.user.delete({
      where: { id },
    }),
};
