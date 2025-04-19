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

/**
 * Represents the response structure for fetching all users from the API.
 *
 * @property success - Indicates whether the API request was successful.
 * @property data - An array of user data objects returned by the API.
 * @property count - The total number of users returned in the response.
 * @property error - An optional error message, present if the request was unsuccessful.
 */
export type UsersApiResponse = Readonly<{
  readonly success: boolean;
  readonly data: readonly UserResponse[];
  readonly count: number;
  readonly error?: string;
}>;
