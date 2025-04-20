// Type Imports
import type { Request, Response } from 'express';
import type { Query, Send } from 'express-serve-static-core';

/**
 * Standard API response format for consistent return structure
 * Allows O(1) type checking at compile time for all responses
 */
export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data: T;
  readonly count?: number;
  readonly queryTime?: number | undefined;
  readonly error?: string;
  readonly message?: string;
}

export type RequestMetrics = {
  readonly queryTime?: number;
  readonly [key: string]: number | undefined;
};

/**
 * Request type with strictly typed body
 * Enforces O(1) type safety for incoming request data
 */
export interface TypedRequestBody<T> extends Request {
  readonly body: T;
  // eslint-disable-next-line functional/prefer-readonly-type
  metrics?: RequestMetrics;
}

/**
 * Request type with strictly typed query parameters
 * Enables O(1) validation of URL query string parameters
 */
export interface TypedRequestQuery<T extends Query> extends Request {
  readonly query: T;
}

/**
 * Combined request type with both body and query typing
 * Provides O(1) type safety for both aspects of requests
 */
export interface TypedRequest<T extends Query, U> extends Request {
  readonly body: U;
  readonly query: T;
}

/**
 * Response type with standardized API format
 * Ensures O(1) consistency across all API responses
 */
export interface TypedResponse<T> extends Response {
  readonly json: Send<ApiResponse<T>, this>;
}
