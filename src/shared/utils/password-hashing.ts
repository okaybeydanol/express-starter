// External Dependencies
import bcrypt from 'bcrypt';

// Type Imports
import type { PasswordHashing } from '#shared/types/password-hashing.types';

/**
 * Hashes a given password using bcrypt and performs validation checks.
 *
 * @param password - The plain text password to be hashed.
 * @returns A promise that resolves to a `PasswordHashing` object containing:
 * - `success: true` and the hashed password in `data` if the operation is successful.
 * - `success: false` and an error message in `error` if the operation fails or the password is invalid.
 *
 * @throws Will not throw directly but will return an error message in the `PasswordHashing` object
 * if an unexpected error occurs during hashing.
 */
export const hashPassword = async (password: string): Promise<PasswordHashing> => {
  // O(1) null/undefined check
  if (password.length === 0) {
    return {
      success: false,
      error: 'Password cannot be empty',
    };
  }

  try {
    const saltRounds = 10; // Balance between security and performance
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    return {
      success: true,
      data: hashedPassword,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? `Password hashing error: ${error.message}`
          : 'Unexpected password hashing error',
    };
  }
};

/**
 * Compares a plain text password with a hashed password
 *
 * @param plainPassword - User provided password during login
 * @param hashedPassword - Stored hash from database
 * @returns Promise with boolean indicating if passwords match
 *
 * O(n) complexity where n depends on hash complexity
 */
export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  // Perform constant-time comparison to prevent timing attacks
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch {
    return false; // Always return false on error for security
  }
};
