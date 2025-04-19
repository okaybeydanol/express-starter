/**
 * Extends the NodeJS `ProcessEnv` interface to include custom environment variables
 * used in the application. These variables are read from the environment and are
 * expected to be defined at runtime.
 *
 * @property NODE_ENV - Specifies the environment in which the application is running.
 *                      Possible values: 'development', 'production', 'test'.
 * @property PORT - The port number on which the application will listen.
 * @property API_URL - The base URL for the application's API.
 * @property CORS_ORIGIN - The allowed origin(s) for Cross-Origin Resource Sharing (CORS).
 *
 * @property DATABASE_URL - The connection string for the application's database.
 *
 * @property JWT_SECRET - The secret key used for signing JSON Web Tokens (JWT).
 * @property JWT_EXPIRES_IN - The expiration time for access tokens in JWT format.
 * @property REFRESH_TOKEN_SECRET - The secret key used for signing refresh tokens.
 * @property REFRESH_TOKEN_EXPIRES_IN - The expiration time for refresh tokens.
 *
 * @property LOG_LEVEL - The logging level for the application.
 *                       Possible values: 'debug', 'error', 'http', 'info', 'warn'.
 * @property LOG_FORMAT - The format of the logs.
 *                        Possible values: 'combined', 'common', 'dev', 'short', 'tiny'.
 *
 * @property RATE_LIMIT_WINDOW_MS - The time window (in milliseconds) for rate limiting.
 * @property RATE_LIMIT_MAX - The maximum number of requests allowed within the rate limit window.
 * @property VERSION - The version of the application.
 */
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly NODE_ENV: 'development' | 'production' | 'test';
      readonly PORT: string;
      readonly API_URL: string;
      readonly CORS_ORIGIN: string;

      readonly DATABASE_URL: string;

      readonly JWT_SECRET: string;
      readonly JWT_EXPIRES_IN: string;
      readonly REFRESH_TOKEN_SECRET: string;
      readonly REFRESH_TOKEN_EXPIRES_IN: string;

      readonly LOG_LEVEL: 'debug' | 'error' | 'http' | 'info' | 'warn';
      readonly LOG_FORMAT: 'combined' | 'common' | 'dev' | 'short' | 'tiny';

      readonly RATE_LIMIT_WINDOW_MS: string;
      readonly RATE_LIMIT_MAX: string;
      readonly VERSION: string;
    }
  }
}

export {};
