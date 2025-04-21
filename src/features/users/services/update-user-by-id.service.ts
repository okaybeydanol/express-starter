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
      if (userData.role === 'ADMIN') {
        return await processAdminUpdate(userData);
      }

      return await processUserUpdate(userData);
    } catch (error) {
      // O(1) error handling to prevent information leakage
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  },
};

/**
 * Updates the `isActive` status of a user by their ID, ensuring input validation
 * and checking for the user's existence before performing the update.
 *
 * @param userData - An object containing the user ID and the `isActive` status to update.
 * @returns A promise that resolves to an object indicating the success or failure of the operation.
 *          - On success: `{ success: true, data: updatedUser }`
 *          - On failure: `{ success: false, error: string }`
 *
 * @remarks
 * - The function validates the input using `updateUserByIdSchema`.
 * - If the user does not exist, it returns an error with the message "User not found".
 * - Only the `isActive` field is updated, defaulting to `true` if not provided.
 *
 * @example
 * ```typescript
 * const result = await processAdminUpdate({ id: '123', isActive: false });
 * if (result.success) {
 *   console.log('User updated:', result.data);
 * } else {
 *   console.error('Update failed:', result.error);
 * }
 * ```
 */
const processAdminUpdate = async (
  userData: Readonly<UpdateUserInput>
): Promise<UpdateUserByIdResult> => {
  // O(1) validate inputs
  const validationResult = updateUserByIdSchema.safeParse({
    id: userData.id,
    isActive: userData.isActive,
    role: userData.role,
  });

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.errors.map((e) => e.message).join(', '),
    };
  }

  // O(1) check if user exists
  const userExists = await updateUserByIdRepository.findUserById(validationResult.data.id);

  if (userExists == null) {
    return {
      success: false,
      error: 'User not found',
    };
  }

  // O(1) update only the isActive field
  const updatedUser = await updateUserByIdRepository.updateUserById(
    validationResult.data.id,
    Object.freeze({ isActive: validationResult.data.isActive ?? true })
  );

  return {
    success: true,
    data: updatedUser,
  };
};

/**
 * Processes the update of a user by validating the input, verifying the current password,
 * and applying the requested changes. Handles password hashing for updates and ensures
 * that only valid changes are applied.
 *
 * @param userData - A readonly object containing the user update input data.
 * @returns A promise that resolves to an object indicating the success or failure of the operation.
 *          On success, the updated user data is included. On failure, an error message is provided.
 *
 * @remarks
 * - Validates the input using `updateUserByIdSchema`.
 * - Fetches the user by ID to verify existence and current password.
 * - Updates user fields such as `firstName`, `lastName`, and `password` if provided.
 * - Ensures that at least one valid change is provided for the update.
 * - Handles password hashing securely before updating the user record.
 *
 * @example
 * ```typescript
 * const result = await processUserUpdate({
 *   id: '123',
 *   currentPassword: 'oldPassword123',
 *   newPassword: 'newPassword456',
 *   firstName: 'John',
 *   lastName: 'Doe',
 * });
 *
 * if (result.success) {
 *   console.log('User updated successfully:', result.data);
 * } else {
 *   console.error('Failed to update user:', result.error);
 * }
 * ```
 */
const processUserUpdate = async (
  userData: Readonly<UpdateUserInput>
): Promise<UpdateUserByIdResult> => {
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
};
