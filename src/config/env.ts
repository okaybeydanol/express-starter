// Node.js Core Modules
import path from 'node:path';

// External Dependencies
import { config } from 'dotenv';
import { z } from 'zod';

// Constants
import { NUMERIC_CONSTANTS } from '#constants/numeric.js';

// Utilities
import log from '#utils/observability/logger';

// Type Imports
import type { EnvKeys } from '#types/env';

/* eslint-disable no-process-env */
/* eslint-disable no-restricted-globals */
/* eslint-disable unicorn/no-process-exit */

// Initialize dotenv configuration
config({
  path: path.resolve(process.cwd(), '.env'),
});

// --------- ENV PROCESSING ---------
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
 * Schema definition for environment variables used in the application.
 * This schema validates and provides default values for various configuration
 * options required by the application.
 * Properties:
 * - `NODE_ENV`: Specifies the environment in which the application is running.
 *   Must be one of 'development', 'test', or 'production'. Defaults to 'development'.
 * - `PORT`: The port number on which the application will run. Defaults to 3000.
 * - `API_URL`: The base URL for the API. Defaults to 'http://localhost:3000'.
 * - `CORS_ORIGIN`: Specifies the allowed origins for CORS. Defaults to '*'.
 * - `DATABASE_URL`: The connection string for the database. This is required.
 * - `API_KEY`: The API key used for authentication. Must meet the minimum length
 *   defined by `NUMERIC_CONSTANTS.MIN_API_KEY_LENGTH`.
 * - `JWT_SECRET`: The secret key used for signing JSON Web Tokens (JWT). Must meet
 *   the minimum length defined by `NUMERIC_CONSTANTS.MIN_JWT_SECRET_LENGTH`.
 * - `JWT_EXPIRES_IN`: The expiration time for JWT tokens. Defaults to '15m'.
 * - `REFRESH_TOKEN_SECRET`: The secret key used for signing refresh tokens. This is required.
 * - `REFRESH_TOKEN_EXPIRES_IN`: The expiration time for refresh tokens. Defaults to '7d'.
 * - `REDIS_URL`: The connection string for the Redis instance. Defaults to 'redis://localhost:6379'.
 * - `LOG_LEVEL`: The logging level for the application. Must be one of 'debug', 'info',
 *   'warn', or 'error'. Defaults to 'info'.
 * - `LOG_FORMAT`: The format for log output. Must be one of 'combined', 'common',
 *   'dev', 'short', or 'tiny'. Defaults to 'dev'.
 * - `RATE_LIMIT_WINDOW_MS`: The time window in milliseconds for rate limiting.
 *   Must meet the minimum value defined by `NUMERIC_CONSTANTS.MIN_RATE_LIMIT_WINDOW_MS`.
 * - `RATE_LIMIT_MAX`: The maximum number of requests allowed within the rate limit window.
 *   Must meet the value defined by `NUMERIC_CONSTANTS.RATE_LIMIT_MAX`. Defaults to 100.
 * - `VERSION`: The version of the application. Defaults to '0.1.0'.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .default('3000'),
  API_URL: z.string().default('http://localhost:3000'),
  CORS_ORIGIN: z.string().default('*'),
  DATABASE_URL: z.string(),
  API_KEY: z.string().min(NUMERIC_CONSTANTS.MIN_API_KEY_LENGTH),
  JWT_SECRET: z.string().min(NUMERIC_CONSTANTS.MIN_JWT_SECRET_LENGTH),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  LOG_FORMAT: z.enum(['combined', 'common', 'dev', 'short', 'tiny']).default('dev'),
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .transform((val) => parseIntEnv(val, NUMERIC_CONSTANTS.MIN_RATE_LIMIT_WINDOW_MS))
    .default('900000'),
  RATE_LIMIT_MAX: z
    .string()
    .transform((val) => parseIntEnv(val, NUMERIC_CONSTANTS.RATE_LIMIT_MAX))
    .default('100'),
  VERSION: z.string().default('0.1.0'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates the environment variables using a predefined schema.
 *
 * @returns {Env} The validated environment variables.
 * @throws {Error} Throws an error if validation fails. If the error is a `ZodError`,
 * it provides detailed messages about the validation issues. Otherwise, it rethrows
 * the original error.
 */
const validateEnv = (): Env => {
  try {
    return envSchema.parse(environmentVariables);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors
        .map((e: z.ZodIssue) => {
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

// Cache for memoized environment config (O(1) access)
let memoizedEnv: EnvKeys | null = null;

/**
 * Creates and returns a memoized environment configuration object.
 *
 * This function validates the environment variables, ensures their structure
 * is optimized for V8 hidden class optimization, and freezes the resulting
 * configuration object to prevent further modifications. The configuration
 * includes details such as the application environment, server port, API URL,
 * CORS settings, database connection, JWT settings, logging preferences, rate
 * limiting options, and application version.
 *
 * @returns {EnvKeys} The memoized and validated environment configuration object.
 */
const createEnvConfig = (): EnvKeys => {
  // Return memoized config if available for O(1) access
  if (memoizedEnv != null) return memoizedEnv;

  const validatedEnv = validateEnv();

  // Create monomorphic object structure for V8 hidden class optimization
  memoizedEnv = Object.freeze({
    nodeEnv: validatedEnv.NODE_ENV,
    port: validatedEnv.PORT,
    apiUrl: validatedEnv.API_URL,
    corsOrigin: validatedEnv.CORS_ORIGIN,

    isDevelopment: validatedEnv.NODE_ENV === 'development',
    isProduction: validatedEnv.NODE_ENV === 'production',
    isTest: validatedEnv.NODE_ENV === 'test',

    db: Object.freeze({
      url: validatedEnv.DATABASE_URL,
    }),

    apiKey: validatedEnv.API_KEY,

    jwt: Object.freeze({
      secret: validatedEnv.JWT_SECRET,
      expiresIn: validatedEnv.JWT_EXPIRES_IN,
      refreshSecret: validatedEnv.REFRESH_TOKEN_SECRET,
      refreshExpiresIn: validatedEnv.REFRESH_TOKEN_EXPIRES_IN,
    }),

    redisUrl: validatedEnv.REDIS_URL,

    logging: Object.freeze({
      level: validatedEnv.LOG_LEVEL as 'debug' | 'error' | 'http' | 'info' | 'warn',
      format: validatedEnv.LOG_FORMAT as 'combined' | 'common' | 'dev' | 'short' | 'tiny',
    }),

    rateLimit: Object.freeze({
      windowMs: validatedEnv.RATE_LIMIT_WINDOW_MS,
      max: validatedEnv.RATE_LIMIT_MAX,
    }),

    version: validatedEnv.VERSION,
  });

  return memoizedEnv;
};

// Immediate validation at module load time for early failure
// This provides fast feedback during development and prevents
// silent failures in production
try {
  validateEnv();
  // Log success only in development to avoid cluttering production logs
  if (environmentVariables.NODE_ENV === 'development') {
    log.info('✅ Environment variables validated successfully');
  }
} catch (error) {
  log.error('❌ Environment validation failed:');
  log.error(error instanceof Error ? error.message : String(error));

  // Only exit in production to allow development with missing vars
  if (environmentVariables.NODE_ENV === 'production') {
    process.exit(1);
  }
}

/**
 * Represents the environment configuration for the application.
 * This configuration is created using the `createEnvConfig` function.
 *
 * O(1) access time for all environment values due to memoization.
 *
 * @constant
 */
export const env = createEnvConfig();
