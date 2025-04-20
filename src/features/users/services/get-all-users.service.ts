// Parent Directory Imports
import { getAllUsersRepository } from '../repositories/get-all-users.repository.js';

// Type Imports
import type { GetAllUsersResult } from '../types/get-all-users.types.js';

/**
 * Service object for managing user-related operations.
 *
 * @remarks
 * This service provides a method to retrieve all users from the database
 * asynchronously. It ensures proper error handling and returns a structured
 * result indicating the success or failure of the operation.
 *
 * @method getAllUsers
 * Retrieves all users from the database.
 *
 * @returns A promise that resolves to an object containing:
 * - `success`: A boolean indicating whether the operation was successful.
 * - `data`: An array of user objects if the operation is successful.
 * - `error`: A string containing an error message if the operation fails.
 */
export const getAllUsersService = {
  /**
   * Service for retrieving all users from the database.
   *
   * @remarks
   * This service provides a method to fetch all users from the database
   * asynchronously. It ensures proper error handling and returns a structured
   * result indicating the success or failure of the operation.
   *
   * @returns A promise that resolves to an object containing:
   * - `success`: A boolean indicating whether the operation was successful.
   * - `data`: An array of user objects if the operation is successful.
   * - `error`: A string containing an error message if the operation fails.
   */
  getAllUsers: async (): Promise<GetAllUsersResult> => {
    try {
      // O(n) database operation to retrieve all users
      const users = await getAllUsersRepository.findAll();

      return {
        success: true,
        data: users,
      };
    } catch (error) {
      // O(1) error handling with proper typing
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve users',
      };
    }
  },
};
