/**
 * Represents the result of a password hashing operation.
 *
 * This type is a discriminated union that can represent either a successful
 * or a failed password hashing operation.
 *
 * @property success - Indicates whether the operation was successful.
 * @property data - The hashed password string, present only if the operation
 * was successful.
 * @property error - The error message, present only if the operation failed.
 */
export type PasswordHashing =
  | {
      readonly success: boolean;
      readonly data: string;
      readonly error?: never;
    }
  | {
      readonly success: boolean;
      readonly error: string | undefined;
      readonly data?: never;
    };
