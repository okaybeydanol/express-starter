// Configuration
import { prisma } from '#config/client.js';

// Type Imports
import type { User } from '@prisma/client';

/**
 * Repository for deleting a user and all related data from the database.
 *
 * Uses a transaction to ensure atomicity - either all data is deleted or none.
 * All operations use indexed lookups for O(1) performance.
 */
export const deleteUserByIdRepository = {
  /**
   * Deletes a user and all associated data in a single atomic transaction
   *
   * @param id - The unique identifier of the user to delete
   * @returns The deleted User object and counts of related deleted data
   *
   * O(1) complexity for user lookup, O(n) for related records where n is the number of records
   */
  deleteById: async (
    id: string
  ): Promise<{
    readonly user: User | null;
    readonly relatedData: {
      readonly invalidatedTokens: number;
    };
  }> => {
    // Default return structure with null user and zero counts
    const result = {
      user: null as User | null,
      relatedData: {
        invalidatedTokens: 0,
      },
    };

    // Use a transaction to ensure all operations succeed or fail together
    await prisma.$transaction(async (tx) => {
      // First check if user exists - O(1) indexed lookup
      const userExists = await tx.user.findUnique({
        where: { id },
        select: { id: true },
      });

      if (userExists === null) {
        return; // User not found, early exit from transaction
      }

      // Delete all invalidated tokens - O(n) where n is token count
      const tokenResult = await tx.invalidatedToken.deleteMany({
        where: { userId: id },
      });

      result.relatedData.invalidatedTokens = tokenResult.count;

      // Finally delete the user itself - O(1) indexed operation
      result.user = await tx.user.delete({
        where: { id },
      });

      // As application grows, additional deletions can be added:
      // const userPrefsResult = await tx.userPreferences.deleteMany({ where: { userId: id } });
      // result.relatedData.preferences = userPrefsResult.count;
    });

    return result;
  },
};
