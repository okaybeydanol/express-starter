// External Dependencies
import { z } from 'zod';

// Type Imports
import type { ReadonlyDeep } from '#types/functional/types';

// --------- ENV CONSTANTS ---------
const MIN_API_KEY_LENGTH = 10;
const MIN_JWT_SECRET_LENGTH = 32;
const MIN_RATE_LIMIT_WINDOW_MS = 900000;

// --------- ENV TYPES ---------
type EnvKeys = Readonly<{
  readonly nodeEnv: string;
  readonly port: number;
  readonly apiUrl: string;
  readonly isDevelopment: boolean;
  readonly isProduction: boolean;
  readonly isTest: boolean;
  readonly corsOrigin: string;
  readonly db: Readonly<{
    readonly url: string;
  }>;
  readonly jwt: Readonly<{
    readonly secret: string;
    readonly expiresIn: string;
    readonly refreshSecret: string;
    readonly refreshExpiresIn: string;
  }>;
  readonly logging: Readonly<{
    readonly level: 'debug' | 'error' | 'http' | 'info' | 'warn';
    readonly format: 'combined' | 'common' | 'dev' | 'short' | 'tiny';
  }>;
  readonly rateLimit: Readonly<{
    readonly windowMs: number;
    readonly max: number;
  }>;
}>;

// --------- ENV PROCESSING ---------
// eslint-disable-next-line no-restricted-globals, no-process-env
const rawEnvironment = process.env;
const environmentVariables = { ...rawEnvironment };

/**
 * Parses an environment variable value as an integer. If the value is undefined
 * or cannot be parsed as a valid integer, a default value is returned.
 *
 * @param value - The string value to parse, typically from an environment variable.
 * @param defaultValue - The default integer value to return if parsing fails.
 * @returns The parsed integer value, or the default value if parsing is unsuccessful.
 */
export const parseIntEnv = (value: string | undefined, defaultValue: number): number => {
  if (value == null) return defaultValue;

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Schema definition for environment variables using Zod.
 * This schema validates and transforms environment variables to ensure
 * they meet the required formats and constraints for the application.
 *
 * Properties:
 * - `NODE_ENV`: Specifies the environment in which the application is running.
 *   Must be one of 'development', 'test', or 'production'. Defaults to 'development'.
 *
 * - `PORT`: The port number on which the application will run.
 *   Transformed from a string to a number. Defaults to 3000.
 *
 * - `DATABASE_URL`: The connection string for the application's database.
 *   Must be a valid string.
 *
 * - `API_KEY`: The API key used for external integrations.
 *   Must be a non-empty string with a minimum length defined by `port`.
 *
 * - `JWT_SECRET`: The secret key used for signing JSON Web Tokens (JWT).
 *   Must be a non-empty string with a minimum length defined by `jwtSecret`.
 *
 * - `REDIS_URL`: The connection string for the Redis instance.
 *   Optional; if provided, must be a valid string.
 *
 * - `LOG_LEVEL`: The logging level for the application.
 *   Must be one of 'debug', 'info', 'warn', or 'error'. Defaults to 'info'.
 *
 * - `JWT_EXPIRES_IN`: The expiration time for JSON Web Tokens.
 *   Must be a valid string. Defaults to '7d'.
 *
 * - `REFRESH_TOKEN_SECRET`: The secret key used for signing refresh tokens.
 *   Must be a valid string.
 *
 * - `REFRESH_TOKEN_EXPIRES_IN`: The expiration time for refresh tokens.
 *   Must be a valid string. Defaults to '30d'.
 *
 * - `API_URL`: The base URL for the application's API.
 *   Must be a valid string. Defaults to 'http://localhost:3000'.
 *
 * - `CORS_ORIGIN`: The allowed origin(s) for Cross-Origin Resource Sharing (CORS).
 *   Must be a valid string. Defaults to '*'.
 *
 * - `LOG_FORMAT`: The format for application logs.
 *   Must be one of 'combined', 'common', 'dev', 'short', or 'tiny'. Defaults to 'dev'.
 *
 * - `RATE_LIMIT_WINDOW_MS`: The time window in milliseconds for rate limiting.
 *   Transformed from a string to a number using `parseIntEnv`. Defaults to 900000 (15 minutes).
 *
 * - `RATE_LIMIT_MAX`: The maximum number of requests allowed within the rate limit window.
 *   Transformed from a string to a number using `parseIntEnv`. Defaults to 100.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .default('3000'),
  DATABASE_URL: z.string(),
  API_KEY: z.string().min(MIN_API_KEY_LENGTH),
  JWT_SECRET: z.string().min(MIN_JWT_SECRET_LENGTH),
  REDIS_URL: z.string().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),
  API_URL: z.string().default('http://localhost:3000'),
  CORS_ORIGIN: z.string().default('*'),
  LOG_FORMAT: z.enum(['combined', 'common', 'dev', 'short', 'tiny']).default('dev'),
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .transform((val) => parseIntEnv(val, MIN_RATE_LIMIT_WINDOW_MS))
    .default('900000'),
  RATE_LIMIT_MAX: z
    .string()
    .transform((val) => parseIntEnv(val, 100))
    .default('100'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates the environment variables against a predefined schema.
 *
 * @returns {Env} The validated environment variables.
 * @throws {Error} Throws an error if the validation fails. If the error is a `ZodError`,
 * it provides detailed messages about the validation issues. Otherwise, it rethrows the original error.
 */
const validateEnv = (): Env => {
  try {
    return envSchema.parse(environmentVariables);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors
        .map((e: ReadonlyDeep<z.ZodIssue>) => {
          const issue = e as z.ZodIssue;
          const pathStr = Array.isArray(issue.path) ? issue.path.join('.') : String(issue.path);

          const msg =
            typeof issue.message === 'string' ? issue.message : 'Unknown validation error';

          return `${pathStr}: ${msg}`;
        })
        .join('\n');
      throw new Error(`Environment validation failed:\n${messages}`);
    }
    throw error;
  }
};

/**
 * Creates a frozen environment configuration object based on validated environment variables.
 * This configuration includes application settings, database credentials, JWT settings, logging preferences,
 * and rate limiting options. The returned object ensures immutability for all nested properties.
 *
 * @returns {EnvKeys} A frozen object containing the application's environment configuration.
 *
 * @property {string} nodeEnv - The current Node.js environment (e.g., 'development', 'production', 'test').
 * @property {number} port - The port number the application will run on.
 * @property {string} apiUrl - The base URL for the application's API.
 * @property {boolean} isDevelopment - Indicates if the application is running in development mode.
 * @property {boolean} isProduction - Indicates if the application is running in production mode.
 * @property {boolean} isTest - Indicates if the application is running in test mode.
 * @property {string} corsOrigin - The allowed origin(s) for Cross-Origin Resource Sharing (CORS).
 * @property {object} db - Database configuration.
 * @property {string} db.url - The database connection URL.
 * @property {object} jwt - JSON Web Token (JWT) configuration.
 * @property {string} jwt.secret - The secret key used for signing JWTs.
 * @property {string} jwt.expiresIn - The expiration time for access tokens.
 * @property {string} jwt.refreshSecret - The secret key used for signing refresh tokens.
 * @property {string} jwt.refreshExpiresIn - The expiration time for refresh tokens.
 * @property {object} logging - Logging configuration.
 * @property {'debug' | 'error' | 'http' | 'info' | 'warn'} logging.level - The logging level.
 * @property {'combined' | 'common' | 'dev' | 'short' | 'tiny'} logging.format - The logging format.
 * @property {object} rateLimit - Rate limiting configuration.
 * @property {number} rateLimit.windowMs - The time window in milliseconds for rate limiting.
 * @property {number} rateLimit.max - The maximum number of requests allowed within the time window.
 */
const createEnvConfig = (): EnvKeys => {
  const validatedEnv = validateEnv();

  return Object.freeze({
    nodeEnv: validatedEnv.NODE_ENV,
    port: validatedEnv.PORT,
    apiUrl: validatedEnv.API_URL,

    isDevelopment: validatedEnv.NODE_ENV === 'development',
    isProduction: validatedEnv.NODE_ENV === 'production',
    isTest: validatedEnv.NODE_ENV === 'test',

    corsOrigin: validatedEnv.CORS_ORIGIN,

    db: Object.freeze({
      url: validatedEnv.DATABASE_URL,
    }),

    jwt: Object.freeze({
      secret: validatedEnv.JWT_SECRET,
      expiresIn: validatedEnv.JWT_EXPIRES_IN,
      refreshSecret: validatedEnv.REFRESH_TOKEN_SECRET,
      refreshExpiresIn: validatedEnv.REFRESH_TOKEN_EXPIRES_IN,
    }),

    logging: Object.freeze({
      level: validatedEnv.LOG_LEVEL as 'debug' | 'error' | 'http' | 'info' | 'warn',
      format: validatedEnv.LOG_FORMAT as 'combined' | 'common' | 'dev' | 'short' | 'tiny',
    }),

    rateLimit: Object.freeze({
      windowMs: validatedEnv.RATE_LIMIT_WINDOW_MS,
      max: validatedEnv.RATE_LIMIT_MAX,
    }),
  });
};

/**
 * Represents the environment configuration for the application.
 * This configuration is created using the `createEnvConfig` function.
 *
 * @constant
 */
export const env = createEnvConfig();
