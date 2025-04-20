// Parent Directory Imports
import { deleteUserByIdRepository } from '../repositories/delete-user-by-id.repository.js';
import { deleteUserByIdSchema } from '../schemas/delete-user-by-id.schema.js';

// Type Imports
import type { DeleteUserByIdResult } from '../types/delete-user-by-id.types.js';

/**
 * Service object for deleting a user by ID.
 *
 * @remarks
 * This service provides a method to delete a specific user from the database
 * by their unique identifier. It ensures proper validation, error handling,
 * and returns a structured result indicating the success or failure of the operation.
 *
 * @method deleteUser
 * Deletes a specific user from the database.
 *
 * @returns A promise that resolves to an object containing:
 * - `success`: A boolean indicating whether the operation was successful.
 * - `data`: An object with the ID of the deleted user if successful.
 * - `error`: A string containing an error message if the operation fails.
 */
export const deleteUserByIdService = {
  /**
   * Deletes a user by their unique identifier.
   *
   * @param id - The unique identifier of the user to delete
   * @returns A promise resolving to a result object with deletion status or error
   *
   * O(1) complexity for database deletion using primary key
   */
  deleteUserById: async (id?: string): Promise<DeleteUserByIdResult> => {
    try {
      // Validate the ID with Zod schema
      const isValidId = deleteUserByIdSchema.safeParse({ id });

      if (!isValidId.success) {
        return {
          success: false,
          error: isValidId.error.errors.map((e) => e.message).join(', '),
        };
      }

      // O(1) database operation to delete a specific user by ID
      const deletedUser = await deleteUserByIdRepository.deleteById(isValidId.data.id);

      if (deletedUser == null) {
        return {
          success: false,
          error: 'User not found or could not be deleted',
        };
      }

      return {
        success: true,
        data: {
          id: deletedUser.id,
        },
      };
    } catch (error) {
      // O(1) error handling with proper typing
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete user',
      };
    }
  },
};
