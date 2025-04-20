// Configuration
import { prisma } from '#config/client.js';

// Parent Directory Imports
import { createUserResponse } from '../transformers/create-user.transformer.js';

// Type Imports
import type { CreateUserParams, CreateUserResponse } from '../types/create-user.types.js';

/**
 * Repository for user-related database operations.
 *
 * Provides methods to create a new user and check for the existence of a user by email.
 *
 * Methods:
 * - `createUser`: Inserts a new user record into the database.
 * - `checkEmailExists`: Verifies if a user with the specified email exists in the database.
 *
 * Complexity:
 * - `createUser`: O(1) for single record insertion with proper indexes.
 * - `checkEmailExists`: O(1) lookup using indexed email field.
 */
export const createUserRepository = {
  /**
   * Creates a new user record in the database
   *
   * @param userData - Validated user creation parameters
   * @returns Newly created user from database with all fields
   *
   * O(1) complexity for single record insertion with proper indexes
   */
  createUser: async (userData: Readonly<CreateUserParams>): Promise<CreateUserResponse> => {
    // Direct database insertion with O(1) complexity
    const newUser = await prisma.user.create({
      data: {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName ?? null,
        lastName: userData.lastName ?? null,
      },
    });

    return createUserResponse(newUser);
  },

  /**
   * Checks if a user with the given email already exists
   *
   * @param email - Email to check
   * @returns Promise resolving to true if email exists, false otherwise
   *
   * O(1) lookup using indexed email field
   */
  checkEmailExists: async (email: string): Promise<boolean> => {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return user !== null;
  },
};
