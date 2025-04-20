// External Dependencies
import { z } from 'zod';

// Parent Directory Imports
import { PASSWORD_SCHEMA } from '../constant/create-user.constant.js';

// Type Imports
import type { PasswordHashing } from '../types/password.types.js';

/**
 * Retrieves a set of commonly used passwords.
 *
 * @returns A frozen `ReadonlySet` containing a list of common passwords.
 *
 * @remarks
 * This function is useful for validating password strength by ensuring
 * that user-provided passwords are not among the most commonly used
 * and easily guessable passwords.
 */
const getCommonPasswords = (): ReadonlySet<string> => {
  const commonPasswords = new Set([
    'password',
    'admin',
    '123456',
    'qwerty',
    '111111',
    'welcome',
    '123123',
    'abc123',
    '1234567890',
    'password1',
  ]);

  return Object.freeze(commonPasswords);
};

/**
 * Password validation with common vulnerability check
 * Uses O(1) lookup to reject common passwords
 *
 * @param password - Password to validate
 * @returns Result containing either validated password or validation errors
 */
const commonPasswordsSet = getCommonPasswords();

/**
 * A Zod schema for validating passwords with the following constraints:
 * - Must be a string.
 * - Minimum length is defined by `PASSWORD_SCHEMA.PASSWORD_MIN_LENGTH`.
 * - Maximum length is defined by `PASSWORD_SCHEMA.PASSWORD_MAX_LENGTH`.
 * - Must contain at least one uppercase letter.
 * - Must contain at least one lowercase letter.
 * - Must contain at least one numeric digit.
 * - Must contain at least one special character (non-alphanumeric).
 * - Cannot be a common or easily guessable password (checked against `commonPasswordsSet`).
 *
 * Validation messages are provided for each constraint to guide users in correcting invalid passwords.
 */
export const passwordSchema = z
  .string()
  .min(PASSWORD_SCHEMA.PASSWORD_MIN_LENGTH, {
    message: `Password must be at least ${PASSWORD_SCHEMA.PASSWORD_MIN_LENGTH} characters long`,
  })
  .max(PASSWORD_SCHEMA.PASSWORD_MAX_LENGTH, {
    message: `Password cannot exceed ${PASSWORD_SCHEMA.PASSWORD_MAX_LENGTH} characters`,
  })
  .regex(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter',
  })
  .regex(/[a-z]/, {
    message: 'Password must contain at least one lowercase letter',
  })
  .regex(/\d/, {
    message: 'Password must contain at least one number',
  })
  .regex(/[^\dA-Za-z]/, {
    message: 'Password must contain at least one special character',
  })
  .refine((password) => !commonPasswordsSet.has(password.toLowerCase().trim()), {
    message: 'Cannot use a common or easily guessable password',
  });

export const validatePassword = (password: string): PasswordHashing => {
  // Common password check with O(1) lookup using Set
  const normalizedPassword = password.toLowerCase().trim();

  if (normalizedPassword.length === 0) {
    return {
      success: false,
      error: 'Password cannot be empty',
    };
  }

  try {
    // O(n) schema validation
    const validatedPassword = passwordSchema.parse(password);
    return { success: true, data: validatedPassword };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof z.ZodError
          ? error.errors.map((e) => e.message).join(', ')
          : 'Invalid password',
    };
  }
};
