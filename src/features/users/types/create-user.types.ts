/**
 * Type definitions for user creation functionality
 * Ensures O(1) type checking throughout the creation flow
 *
 * @module create-user.types
 */

/**
 * Parameters required to create a new user
 * Contains all necessary fields with appropriate types
 *
 * O(1) validation during compile time
 */
export type CreateUserParams = {
  readonly email: string;
  readonly firstName: string | null | undefined;
  readonly lastName: string | null | undefined;
  readonly password: string;
};

/**
 * Represents the response returned after creating a user.
 *
 * @property id - The unique identifier of the user.
 * @property email - The email address of the user.
 * @property firstName - The first name of the user, or `null` if not provided.
 * @property lastName - The last name of the user, or `null` if not provided.
 * @property isActive - Indicates whether the user is active.
 * @property createdAt - The timestamp when the user was created.
 * @property updatedAt - The timestamp when the user was last updated.
 */
export type CreateUserResponse = {
  readonly id: string;
  readonly email: string;
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

/**
 * Represents the input data required to create a new user.
 *
 * @property email - The email address of the user. This field is required.
 * @property password - The password for the user account. This field is required.
 * @property firstName - The first name of the user. This field is optional and can be null.
 * @property lastName - The last name of the user. This field is optional and can be null.
 */
export type CreateUserInput = {
  readonly email: string;
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly password: string;
  readonly passwordConfirm: string;
};

// Service result type with monadic error handling
export type CreateUserResult =
  | { readonly success: false; readonly error: string; readonly data?: never }
  | { readonly success: true; readonly data: CreateUserResponse; readonly error?: never };
