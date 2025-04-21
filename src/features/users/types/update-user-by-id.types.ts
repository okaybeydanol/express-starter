// Type Imports
import type { Role } from '@prisma/client';

/**
 * Type definitions for user update functionality
 * Ensures O(1) type checking throughout the update flow
 *
 * @module update-user-by-id.types
 */

/**
 * Represents the input data for updating a user.
 *
 * @property currentPassword - Current password for verification before updates
 * @property newPassword - Optional new password to replace current one
 * @property newPasswordConfirm - Confirmation of new password if changing
 * @property firstName - Optional updated first name
 * @property lastName - Optional updated last name
 */
export type UpdateUserInput = {
  readonly id: string;
  readonly currentPassword: string;
  readonly newPassword?: string;
  readonly newPasswordConfirm?: string;
  readonly firstName?: string | null;
  readonly lastName?: string | null;
  readonly role: Role;
  readonly isActive?: boolean;
};

/**
 * Parameters used internally for updating a user in the database.
 * Contains only the fields that will actually be updated.
 *
 * O(1) validation during compile time
 */
export type UpdateUserParams = {
  readonly password?: string;
  readonly firstName?: string | null;
  readonly lastName?: string | null;
  readonly isActive?: boolean;
};

/**
 * Represents the response returned after updating a user.
 *
 * @property id - The unique identifier of the user.
 * @property email - The email address of the user.
 * @property firstName - The updated first name of the user, or `null` if not provided.
 * @property lastName - The updated last name of the user, or `null` if not provided.
 * @property updatedAt - The timestamp when the user was last updated.
 */
export type UpdateUserByIdResponse = {
  readonly id: string;
  readonly email: string;
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly isActive: boolean;
  readonly role: Role;
  readonly updatedAt: Date;
};

/**
 * Represents the result of a user update operation.
 * Uses a discriminated union type for better type safety and error handling.
 *
 * O(1) type checking during development and runtime
 */
export type UpdateUserByIdResult =
  | { readonly success: false; readonly error: string; readonly data?: never }
  | { readonly success: true; readonly data: UpdateUserByIdResponse; readonly error?: never };
