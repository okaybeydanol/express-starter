// Parent Directory Imports
import { updateUserByIdRepository } from '../repositories/update-user-by-id.repository.js';
import { updateUserByIdSchema } from '../schemas/update-user-by-id.schema.js';
import { comparePassword, hashPassword } from '../utils/password-hashing.js';

// Type Imports
import type {
  UpdateUserByIdResult,
  UpdateUserInput,
  UpdateUserParams,
} from '../types/update-user-by-id.types.js';

/**
 * Service for updating an existing user in the system.
 *
 * This service handles the following tasks:
 * - Validates the update data using a zod schema
 * - Verifies the current password before allowing updates
 * - Hashes the new password if provided
 * - Updates user information in the database
 *
 * ### Methods:
 * - `updateUser(userId: string, userData: Readonly<UpdateUserInput>): Promise<UpdateUserResult>`:
 *   Updates an existing user and returns the result of the operation.
 *
 * ### Complexity:
 * - **O(n)** for input validation using the zod schema.
 * - **O(1)** for fetching the user by ID from the database.
 * - **O(n)** for password comparison using bcrypt.
 * - **O(n)** for hashing the new password using bcrypt.
 * - **O(1)** for updating the user in the database.
 *
 * ### Error Handling:
 * - Provides user-friendly error messages for validation failures.
 * - Returns specific error messages for invalid current password.
 * - Catches unexpected errors and ensures sensitive information is not leaked.
 *
 * ### Returns:
 * - A promise that resolves to an object containing:
 *   - `success`: A boolean indicating the success of the operation.
 *   - `data`: The updated user object (if successful).
 *   - `error`: An error message (if unsuccessful).
 */
export const updateUserByIdService = {
  /**
   * Updates an existing user by validating input, verifying current password,
   * optionally hashing a new password, and storing updated information.
   *
   * @param userId - The ID of the user to update
   * @param userData - The raw input data with update information
   * @returns A promise that resolves to a result object containing:
   * - `success`: A boolean indicating whether the operation was successful.
   * - `data`: The updated user object (if successful).
   * - `error`: An error message (if unsuccessful).
   */
  updateUser: async (userData: Readonly<UpdateUserInput>): Promise<UpdateUserByIdResult> => {
    try {
      // O(n) input validation using zod schema
      const validationResult = updateUserByIdSchema.safeParse(userData);

      if (!validationResult.success) {
        return {
          success: false,
          error: validationResult.error.errors.map((e) => e.message).join(', '),
        };
      }

      // O(1) fetch user to verify password and check existence
      const user = await updateUserByIdRepository.findUserById(validationResult.data.id);

      if (user == null) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // O(n) verify current password
      const passwordValid = await comparePassword(userData.currentPassword, user.password);
      if (!passwordValid) {
        return {
          success: false,
          error: 'Current password is incorrect',
        };
      }

      // Prepare update parameters
      let updatedParams: UpdateUserParams = {};

      // Set name fields if provided
      updatedParams =
        userData.firstName !== undefined
          ? { ...updatedParams, firstName: userData.firstName }
          : updatedParams;

      updatedParams =
        userData.lastName !== undefined
          ? { ...updatedParams, lastName: userData.lastName }
          : updatedParams;

      // Handle password change if requested
      if (userData.newPassword != null) {
        // O(n) hash new password
        const hashResult = await hashPassword(userData.newPassword);

        if (!hashResult.success || hashResult.data == null) {
          return {
            success: false,
            error: hashResult.error ?? 'Failed to hash new password',
          };
        }
        updatedParams = { ...updatedParams, password: hashResult.data };
      }

      // Check if there's anything to update
      if (Object.keys(updatedParams).length === 0) {
        return {
          success: false,
          error: 'No changes provided for update',
        };
      }

      // O(1) update user with validated and secured data
      const updatedUser = await updateUserByIdRepository.updateUserById(
        validationResult.data.id,
        updatedParams
      );

      // Return successful response with updated user data
      return {
        success: true,
        data: updatedUser,
      };
    } catch (error) {
      // O(1) error handling to prevent information leakage
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  },
};
