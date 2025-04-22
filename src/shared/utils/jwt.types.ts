/**
 * Type definition for JWT payload structure.
 *
 * @property id - User's unique identifier
 * @property email - User's email address
 * @property isActive - Whether the user is active
 * @property iat - Issued at timestamp
 * @property exp - Expiration timestamp
 *
 * O(1) property access with strongly typed fields
 */
export type JwtPayload = {
  readonly id: string;
  readonly email: string;
  readonly isActive: boolean;
  readonly iat?: number;
  readonly exp?: number;
};

/**
 * Represents the result of verifying a JWT token.
 *
 * This type is a union of two possible outcomes:
 * - A failure result, where `success` is `false` and an `error` message is provided.
 * - A success result, where `success` is `true` and the decoded `payload` is included.
 *
 * @property success - Indicates whether the token verification was successful.
 * @property error - A string describing the error, present only when `success` is `false`.
 * @property payload - The decoded JWT payload, present only when `success` is `true`.
 */
export type VerifyTokenResult =
  | { readonly success: false; readonly error: string }
  | { readonly success: true; readonly payload: JwtPayload };
