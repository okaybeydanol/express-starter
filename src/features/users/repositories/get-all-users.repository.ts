// Configuration
import { prisma } from '#config/client.js';

// Parent Directory Imports
import { getAllUsersResponse } from '../transformers/get-all-users.transformer.js';

// Type Imports
import type { UserResponse } from '../types/get-all-users.types.js';

/**
 * Repository for retrieving all users from the database.
 *
 * @property findAll - Asynchronously retrieves all users from the database,
 * ordered by their creation date in descending order. Maps the retrieved
 * users to a `UserResponse` format.
 *
 * @returns A promise that resolves to a readonly array of `UserResponse` objects.
 */
export const getAllUsersRepository = {
  findAll: async (): Promise<readonly UserResponse[]> => {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users.map(getAllUsersResponse);
  },
};
