/**
 * Represents the response structure for a single user.
 *
 * @property id - The unique identifier of the user.
 * @property email - The email address of the user.
 * @property firstName - The first name of the user, or null if not provided.
 * @property lastName - The last name of the user, or null if not provided.
 * @property isActive - Indicates whether the user is active.
 * @property createdAt - The date and time when the user was created.
 * @property updatedAt - The date and time when the user was last updated.
 */
export type GetUserByIdResponse = {
  readonly id: string;
  readonly email: string;
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

/**
 * Represents the response from the getUserById service.
 * Uses a discriminated union type for better type safety and error handling.
 *
 * O(1) type checking during development and runtime
 */
export type GetUserByIdResult =
  | { readonly success: false; readonly error: string; readonly data?: never }
  | { readonly success: true; readonly data: GetUserByIdResponse; readonly error?: never };
