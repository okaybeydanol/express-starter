// External Dependencies
import { expect } from 'vitest';

/**
 * Asserts that the given response is a successful HTTP response with the expected data.
 *
 * @param response - The HTTP response object to be validated.
 * @param data - The expected data to be compared against the response body.
 *
 * @remarks
 * This function checks that the response has a status code of 200,
 * and that the response body contains a `success` field set to `true`,
 * the provided `data`, and a `count` field equal to the length of the `data` array.
 *
 * @example
 * ```typescript
 * const response = {
 *   status: 200,
 *   body: {
 *     success: true,
 *     data: [{ id: 1, name: 'Item 1' }],
 *     count: 1,
 *   },
 * };
 * const data = [{ id: 1, name: 'Item 1' }];
 * assertSuccessResponse(response, data);
 * ```
 */
export const assertSuccessResponse = (response, data) => {
  expect(response.status).toBe(200);
  expect(response.body).toEqual({
    success: true,
    data,
    count: data.length,
  });
};
