// Parent Directory Imports
import { getUserByIdRepository } from '../repositories/get-user-by-id.repository.js';
import { getUserByIdSchema } from '../schemas/get-user-by-id.schema.js';

// Type Imports
import type { GetUserByIdResult } from '../types/get-user-by-id.types.js';

/**
 * Service object for retrieving a single user by ID.
 *
 * @remarks
 * This service provides a method to retrieve a specific user from the database
 * by their unique identifier. It ensures proper error handling and returns a structured
 * result indicating the success or failure of the operation.
 *
 * @method getUserById
 * Retrieves a specific user from the database.
 *
 * @returns A promise that resolves to an object containing:
 * - `success`: A boolean indicating whether the operation was successful.
 * - `data`: A user object if the operation is successful and user is found.
 * - `error`: A string containing an error message if the operation fails.
 */
export const getUserByIdService = {
  /**
   * Retrieves a user by their unique identifier.
   *
   * @param id - The unique identifier of the user to retrieve
   * @returns A promise resolving to a result object with user data or error
   *
   * O(1) complexity for database lookup using primary key
   */
  getUserById: async (id?: string): Promise<GetUserByIdResult> => {
    try {
      // Input validation for UUID format could be added here
      const isValidId = getUserByIdSchema.safeParse({ id });

      if (!isValidId.success) {
        return {
          success: false,
          error: isValidId.error.errors.map((e) => e.message).join(', '),
        };
      }

      // O(1) database operation to find a specific user by ID
      const user = await getUserByIdRepository.findById(isValidId.data.id);

      if (user == null) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      // O(1) error handling with proper typing
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve user',
      };
    }
  },
};
