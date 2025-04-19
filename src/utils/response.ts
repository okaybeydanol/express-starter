// Type Imports
import type { Response } from 'express';

/**
 * Represents the structure of a standardized response object.
 *
 * @template T - The type of the optional `data` property. Defaults to `unknown`.
 * @property status - The HTTP status code of the response.
 * @property data - Optional payload containing additional data of type `T`.
 * @property message - A descriptive message providing details about the response.
 */
type ResponseData<T = unknown> = Readonly<{
  readonly status: number;
  readonly data?: T;
  readonly message: string;
}>;

/**
 * Sends a standardized JSON response to the client.
 *
 * @template T - The type of the data being sent in the response.
 * @param res - The Express `Response` object used to send the response.
 * @param data - An object containing the response details.
 * @param data.status - The HTTP status code of the response.
 * @param data.data - The payload or data to be sent in the response.
 * @param data.message - A message providing additional information about the response.
 *
 * @returns void
 */
export const sendResponse = <T = unknown>(res: Response, data: ResponseData<T>): void => {
  res.status(data.status).json({
    status: data.status,
    data: data.data,
    message: data.message,
  });
};
