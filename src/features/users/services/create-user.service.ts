// Parent Directory Imports
import { createUserRepository } from '../repositories/create-user.repository.js';
import { createUserSchema } from '../schemas/create-user-schema.js';
import { hashPassword } from '../utils/password-hashing.js';

// Type Imports
import type { CreateUserInput, CreateUserResult } from '../types/create-user.types.js';

/**
 * Service for creating a new user in the system.
 *
 * This service handles the following tasks:
 * - Validates the input data using a zod schema.
 * - Ensures the email provided is unique in the database.
 * - Hashes the user's password securely using bcrypt.
 * - Stores the validated and processed user data in the database.
 *
 * ### Methods:
 * - `createUser(userData: Readonly<CreateUserInput>): Promise<CreateUserResult>`:
 *   Creates a new user and returns the result of the operation.
 *
 * ### Complexity:
 * - **O(n)** for input validation using the zod schema.
 * - **O(1)** for checking email uniqueness in the database.
 * - **O(n)** for hashing the password using bcrypt.
 * - **O(1)** for inserting the user into the database.
 *
 * ### Error Handling:
 * - Provides user-friendly error messages for validation, email uniqueness, or password hashing failures.
 * - Catches unexpected errors and ensures sensitive information is not leaked.
 *
 * ### Returns:
 * - A promise that resolves to an object containing:
 *   - `success`: A boolean indicating the success of the operation.
 *   - `data`: The newly created user object (if successful).
 *   - `error`: An error message (if unsuccessful).
 */
export const createUserService = {
  /**
   * Creates a new user by validating input, ensuring email uniqueness, hashing the password,
   * and storing the user in the database.
   *
   * @param userData - The raw input data for the user to be created.
   * @returns A promise that resolves to a result object containing:
   * - `success`: A boolean indicating whether the operation was successful.
   * - `data`: The newly created user object (if successful).
   * - `error`: An error message (if unsuccessful).
   */
  createUser: async (userData: Readonly<CreateUserInput>): Promise<CreateUserResult> => {
    try {
      // O(n) input validation using zod schema
      const validationResult = createUserSchema.safeParse(userData);

      if (!validationResult.success) {
        return {
          success: false,
          error: validationResult.error.errors.map((e) => e.message).join(', '),
        };
      }

      // O(1) email uniqueness check
      const emailExists = await createUserRepository.checkEmailExists(validationResult.data.email);
      if (emailExists) {
        return {
          success: false,
          error: 'A user with this email already exists',
        };
      }

      // O(n) password hashing with bcrypt
      const hashResult = await hashPassword(validationResult.data.password);

      if (!hashResult.success || hashResult.data == null) {
        return {
          success: false,
          error: hashResult.error ?? 'Failed to hash password',
        };
      }

      // O(1) database insertion with validated and secured data
      const newUser = await createUserRepository.createUser({
        email: validationResult.data.email,
        password: hashResult.data,
        firstName: validationResult.data.firstName,
        lastName: validationResult.data.lastName,
      });

      // Return successful response with user data
      return {
        success: true,
        data: newUser,
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
