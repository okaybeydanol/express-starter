/**
 * Configuration options for the rate limiter middleware.
 *
 * @property windowMs - The time window in milliseconds for which the rate limit applies.
 * @property max - The maximum number of requests allowed within the specified time window.
 * @property message - The message to be sent when the rate limit is exceeded.
 */
export type RateLimiterConfig = Readonly<{
  readonly windowMs: number;
  readonly max: number;
  readonly message: string;
}>;
