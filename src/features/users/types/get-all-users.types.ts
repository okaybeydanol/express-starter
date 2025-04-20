/**
 * Represents the response structure for a user.
 *
 * @property id - The unique identifier of the user.
 * @property email - The email address of the user.
 * @property firstName - The first name of the user, or null if not provided.
 * @property lastName - The last name of the user, or null if not provided.
 * @property isActive - Indicates whether the user is active.
 * @property createdAt - The date and time when the user was created.
 * @property updatedAt - The date and time when the user was last updated.
 */
export type UserResponse = Readonly<{
  readonly id: string;
  readonly email: string;
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}>;
