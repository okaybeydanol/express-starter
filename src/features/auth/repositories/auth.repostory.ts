// Configuration
import { prisma } from '#config/client';

// Type Imports
import type { User } from '@prisma/client';

/**
 * Repository for authentication-related database operations.
 *
 * @remarks
 * This repository provides methods for interacting with the `User` table in the database,
 * specifically for authentication purposes. It includes optimized queries for retrieving
 * user data based on specific criteria.
 *
 * @example
 * ```typescript
 * const user = await authRepository.findByEmail('example@example.com');
 * if (user) {
 *   console.log(`User found: ${user.email}`);
 * } else {
 *   console.log('User not found');
 * }
 * ```
 */
export const authRepository = {
  /**
   * Finds a user by their email address with an optimized query.
   *
   * @param email - The email address of the user to find.
   * @param includeInactive - Optional flag to include inactive users in the search. Defaults to `false`.
   * @returns A promise that resolves to a user object containing `id`, `email`, `password`, and `isActive` fields if found, or `null` otherwise.
   *
   * @remarks
   * - This method performs an O(1) lookup using an indexed email field.
   * - The query is optimized to transfer minimal data by projecting only the required fields.
   * - Conditional filtering is applied based on the `includeInactive` parameter.
   */
  findByEmail: async (
    email: string,
    includeInactive: boolean = false
  ): Promise<Pick<User, 'email' | 'id' | 'isActive' | 'password'> | null> =>
    // O(1) field projection for minimal data transfer
    await prisma.user.findUnique({
      where: {
        email,
        // O(1) conditional filter based on parameter
        ...(includeInactive ? {} : { isActive: true }),
      },
      select: {
        id: true,
        email: true,
        password: true,
        isActive: true,
      },
    }),
};
