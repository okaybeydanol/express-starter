// Configuration
import { prisma } from '#config/client.js';

// Parent Directory Imports
import { getUserByIdResponse } from '../transformers/get-user-by-id.transformer.js';

// Type Imports
import type { UserResponse } from '../types/get-all-users.types.js';

/**
 * Repository for retrieving a single user by ID from the database.
 *
 * @property findById - Asynchronously retrieves a user by their unique ID.
 * The function uses Prisma's O(1) indexed lookup for maximum performance.
 *
 * @returns A promise that resolves to a UserResponse object if found, or null if not found.
 */
export const getUserByIdRepository = {
  /**
   * Finds a user by their unique ID
   *
   * @param id - The unique identifier of the user
   * @returns UserResponse object if user is found, null otherwise
   *
   * O(1) complexity using primary key lookup
   */
  findById: async (id: string): Promise<UserResponse | null> => {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (user == null) {
      return null;
    }

    return getUserByIdResponse(user);
  },
};
