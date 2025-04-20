/**
 * Represents the response from the deleteUser service.
 * Uses a discriminated union type for better type safety and error handling.
 *
 * O(1) type checking during development and runtime
 */
export type DeleteUserByIdResult =
  | { readonly success: false; readonly error: string; readonly data?: never }
  | { readonly success: true; readonly data: { readonly id: string }; readonly error?: never };
