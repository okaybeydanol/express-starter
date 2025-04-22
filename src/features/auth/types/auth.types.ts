/**
 * Login request DTO structure.
 *
 * @property email - User's email address
 * @property password - User's password
 *
 * O(1) validation using zod schema
 */
export type LoginRequest = {
  readonly email: string;
  readonly password: string;
};

/**
 * Result of login operation with discriminated union pattern
 * for type-safe error handling.
 *
 * O(1) type discrimination with success flag
 */
export type LoginResult =
  | {
      readonly success: false;
      readonly error: string;
    }
  | {
      readonly success: true;
      readonly token: string;
      readonly data: {
        readonly id: string;
        readonly email: string;
      };
      readonly refreshToken: string;
    };

/**
 * Refresh token request DTO structure.
 *
 * @property refreshToken - The refresh token to validate
 *
 * O(1) validation using zod schema
 */
export type RefreshTokenRequest = {
  readonly refreshToken: string;
};

/**
 * Result of refresh token operation with discriminated union pattern
 * for type-safe error handling.
 *
 * O(1) type discrimination with success flag
 */
export type RefreshTokenResult =
  | {
      readonly success: false;
      readonly error: string;
    }
  | {
      readonly success: true;
      readonly token: string;
      readonly refreshToken: string;
    };
