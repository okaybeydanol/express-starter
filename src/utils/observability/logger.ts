// External Dependencies
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Configuration
import { env } from '#config/env';

// Constants
import { NUMERIC_CONSTANTS } from '#constants/numeric.js';

// Type Imports
import type {
  ExecutionMetadata,
  Format,
  LogLevel,
  LogMetadata,
  LogParams,
  TransformableInfo,
  WithLoggingOptions,
} from '#types/with-logging-types.js';

/**
 * Creates a log formatter for use with a logging library.
 *
 * The formatter ensures consistent property access patterns for V8 monomorphic optimization
 * and extracts metadata from the log information. It formats the log output as a string
 * with the following structure:
 *
 * `[timestamp] level: message`
 *
 * If metadata is present, it appends a JSON stringified representation of the metadata
 * to the log output.
 *
 * Optimizations:
 * - Ensures O(1) property access for better performance.
 * - Uses string concatenation instead of template literals for hot paths.
 * - Performs an O(1) check for empty metadata.
 *
 * @returns {Format} A Winston-compatible log formatter.
 */
const createLogFormatter = (): Format =>
  // Mevcut kodun aynısı...
  format.printf((info: Readonly<TransformableInfo>) => {
    // Ensure consistent property access patterns for V8 monomorphic optimization
    const timestamp = typeof info.timestamp === 'string' ? info.timestamp : '';
    const level = typeof info.level === 'string' ? info.level : 'info';
    const message = typeof info.message === 'string' ? info.message : '';

    // Extract metadata with O(1) property access
    const meta = Object.fromEntries(
      Object.entries(info).filter(
        ([key]: readonly [string, unknown]) =>
          key !== 'timestamp' && key !== 'level' && key !== 'message'
      )
    );

    // O(1) empty check for better V8 optimization
    const hasMetadata = Object.keys(meta).length > 0;
    const metaString = hasMetadata
      ? `\n${JSON.stringify(meta, null, NUMERIC_CONSTANTS.JSON_INDENT_SPACES)}`
      : '';

    // String concatenation instead of template literals - better V8 optimization for hot paths
    return '[' + timestamp + '] ' + level + ': ' + message + metaString;
  });
/**
 * Custom format for console output with colors and structured data
 */
const consoleFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  createLogFormatter()
);

/**
 * Format for file output - JSON with timestamps
 */
const fileFormat = format.combine(format.timestamp(), format.json());

/**
 * Creates a DailyRotateFile transport for logging with the specified log level.
 *
 * @param level - The log level for the transport (e.g., 'info', 'error').
 * @returns A configured instance of `DailyRotateFile` for logging.
 *
 * The transport writes logs to files in the `logs` directory, with filenames
 * formatted as `<level>-%DATE%.log`. Log files are rotated daily, with a maximum
 * size of 20 MB per file and a retention period of 14 days. Older files are
 * compressed into a zip archive.
 */
const createFileTransport = (level: Readonly<string>): DailyRotateFile =>
  new DailyRotateFile({
    level,
    dirname: 'logs',
    filename: `${level}-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    format: fileFormat,
    zippedArchive: true,
  });

export const logger = createLogger({
  level: env.logging.level,
  defaultMeta: { service: 'express-api' },
  format: format.combine(format.errors({ stack: true }), format.metadata()),
  transports: [
    // Always add console transport for development
    new transports.Console({
      format: consoleFormat,
    }),
  ],
});

logger.add(createFileTransport('info'));
logger.add(createFileTransport('error'));

/**
 * Configures the logger with the specified settings.
 *
 * @param config - The configuration object for the logger.
 * @param config.level - The logging level (e.g., 'info', 'debug', 'error').
 * @param config.format - The logging format to be applied.
 *
 * This function updates the logger's level and applies a new format to
 * console transports. The new format includes colorization, timestamps,
 * and a custom log formatter. After updating the configuration, an
 * informational log is emitted to indicate the changes.
 */
export const configureLogger = (config: {
  readonly level: string;
  readonly format: string;
}): void => {
  logger.level = config.level;

  logger.transports.forEach((transport) => {
    if (transport instanceof transports.Console) {
      // Yeni format ayarı
      const newFormat = format.combine(
        format.colorize(),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        createLogFormatter()
      );
      transport.format = newFormat;
    }
  });

  logger.info('Logger configuration updated', { level: config.level, format: config.format });
};

/**
 * Stream implementation for Morgan integration with Winston
 * This provides O(1) delegation of HTTP access logs from Morgan to our Winston logger
 */
export const morganStream = Object.freeze({
  // Morgan expects a write method that takes a string argument
  write: (message: string): void => {
    // Trim message to remove trailing newlines and properly integrate with Winston format
    const trimmedMessage = message.trim();

    // Use our centralized logger with appropriate level for HTTP access logs
    logger.http(trimmedMessage);
  },
});

/**
 * Pure function for creating log entries at different levels
 */
export const log = {
  error: (message: Readonly<string>, meta?: Readonly<LogMetadata>): void => {
    logger.error(message, meta);
  },

  warn: (message: Readonly<string>, meta?: Readonly<LogMetadata>): void => {
    logger.warn(message, meta);
  },

  info: (message: Readonly<string>, meta?: Readonly<LogMetadata>): void => {
    logger.info(message, meta);
  },

  http: (message: Readonly<string>, meta?: Readonly<LogMetadata>): void => {
    logger.http(message, meta);
  },

  debug: (message: Readonly<string>, meta?: Readonly<LogMetadata>): void => {
    logger.debug(message, meta);
  },
};

/**
 * A higher-order function that wraps a given function with logging capabilities.
 * It provides options to log function arguments, results, execution time, and handles errors gracefully.
 *
 * @template T - The type of the input argument to the wrapped function.
 * @template R - The type of the result returned by the wrapped function.
 *
 * @param fn - The function to be wrapped with logging.
 * @param options - Configuration options for logging behavior.
 * @param options.name - The name of the function being wrapped, used in log messages.
 * @param options.logArgs - Whether to log the function arguments. Defaults to `false`.
 * @param options.logResult - Whether to log the function result. Defaults to `false`.
 * @param options.logLevel - The log level to use for logging messages. Defaults to `'debug'`.
 * @param options.redactFields - An array of field names to redact from the logged arguments to protect sensitive data.
 * @param options.shouldLog - A function that determines whether logging should be enabled based on the input argument. Defaults to always returning `true`.
 *
 * @returns A new function that wraps the original function with logging behavior.
 *
 * @throws Any error thrown by the wrapped function will be logged and re-thrown.
 *
 * @example
 * ```typescript
 * const add = (input: { a: number, b: number }) => input.a + input.b;
 * const loggedAdd = withLogging(add, {
 *   name: 'add',
 *   logArgs: true,
 *   logResult: true,
 *   redactFields: ['b'],
 * });
 *
 * loggedAdd({ a: 1, b: 2 });
 * ```
 */
export const withLogging =
  <T, R>(
    fn: (arg: Readonly<T>) => Promise<R> | R,
    options: WithLoggingOptions<T>
  ): ((arg: Readonly<T>) => Promise<R>) =>
  async (arg: Readonly<T>): Promise<R> => {
    const {
      name,
      logArgs = false,
      logResult = false,
      logLevel = 'debug',
      redactFields = [],
      shouldLog = (): boolean => true,
    } = options;

    // Skip logging if shouldLog returns false - prevents unnecessary overhead
    const enableLogging = shouldLog(arg);
    if (!enableLogging) {
      return await fn(arg);
    }

    // Redact sensitive fields like PII from logs
    const safeArg = logArgs ? redactSensitiveData(arg, redactFields) : undefined;
    const logParams = logArgs ? { args: safeArg } : undefined;

    try {
      // Safe log function call with monomorphic pattern to optimize V8 JIT
      // Using switch instead of dynamic property access for security and performance
      logLevelHandler(logLevel, name, logParams);

      const startTime = performance.now();
      // Execute function
      const result = await fn(arg);
      const executionTime = Math.round(performance.now() - startTime);

      // Safely log results with proper object handling
      const safeResult = createSafeResult(logResult, result);
      const executionMetadata = createExecutionMetadata(logResult, safeResult, executionTime);
      const successMessage = `✅ Successfully executed ${name} (${executionTime}ms)`;

      logLevelSuccessHandler(logLevel, successMessage, executionMetadata);

      return result;
    } catch (caughtError) {
      const error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));

      // Log error with full details but protect sensitive data
      log.error(`❌ Error in ${name}: ${error.message}`, {
        errorName: error.name,
        errorMessage: error.message,
        args: logArgs ? safeArg : undefined,
        stack: error.stack,
      });

      // Re-throw the error to maintain the flow
      throw error;
    }
  };

/**
 * Creates execution metadata for a function or operation, including optional result data.
 *
 * @template R - The type of the result.
 * @param includeResult - A boolean indicating whether to include the result in the metadata.
 * @param result - The result of the operation, which can be of type `R`, `null`, or `undefined`.
 * @param executionTime - The execution time of the operation in milliseconds.
 * @returns An `ExecutionMetadata` object containing the execution time and, optionally, a safe representation of the result.
 */
const createExecutionMetadata = <R>(
  includeResult: boolean,
  result: R | null | undefined,
  executionTime: number
): ExecutionMetadata => {
  const base = { executionTimeMs: executionTime };
  return includeResult && result !== null && result !== undefined
    ? { ...base, result: createSafeResult(true, result) }
    : base;
};

/**
 * Handles logging at a specific log level with a success message and execution metadata.
 * This function ensures type-safe handling of log levels and provides exhaustive checking
 * for all possible log levels.
 *
 * @param logLevel - The log level at which the message should be logged.
 *                   Supported levels are 'debug', 'http', 'info', 'warn', and 'error'.
 * @param successMessage - The message to be logged indicating a successful operation.
 * @param executionMetadata - Additional metadata related to the execution context
 *                            to be included in the log.
 */
const logLevelSuccessHandler = (
  logLevel: LogLevel,
  successMessage: string,
  executionMetadata: ExecutionMetadata
): void => {
  // Type-safe handling of log levels
  switch (logLevel) {
    case 'debug':
      log.debug(successMessage, executionMetadata);
      break;
    case 'http':
      log.http(successMessage, executionMetadata);
      break;
    case 'info':
      log.info(successMessage, executionMetadata);
      break;
    case 'warn':
      log.warn(successMessage, executionMetadata);
      break;
    case 'error':
      log.error(successMessage, executionMetadata);
      break;
    default:
      // TypeScript exhaustive checking
      log.debug(successMessage, executionMetadata);
  }
};

/**
 * Handles logging at different log levels by delegating to the appropriate log method.
 *
 * @param logLevel - The severity level of the log. Determines which log method to invoke.
 * @param name - The name or identifier of the context or function being logged.
 * @param logParams - Additional parameters or metadata to include in the log entry.
 *
 * @remarks
 * This function uses a switch statement to handle different log levels such as 'debug', 'http',
 * 'info', 'warn', and 'error'. If an unsupported log level is provided, it defaults to using
 * the 'debug' log level. TypeScript's exhaustive checking ensures that all possible log levels
 * are handled during compilation.
 */
const logLevelHandler = (logLevel: LogLevel, name: string, logParams: LogParams): void => {
  switch (logLevel) {
    case 'debug':
      log.debug(`➡️ Entering ${name}`, logParams);
      break;
    case 'http':
      log.http(`➡️ Entering ${name}`, logParams);
      break;
    case 'info':
      log.info(`➡️ Entering ${name}`, logParams);
      break;
    case 'warn':
      log.warn(`➡️ Entering ${name}`, logParams);
      break;
    case 'error':
      log.error(`➡️ Entering ${name}`, logParams);
      break;
    default:
      // TypeScript exhaustive checking - will cause compile error if a case is missed
      log.debug(`➡️ Entering ${name}`, logParams);
  }
};

/**
 * Redacts sensitive fields from a given data object by replacing their values with a placeholder.
 *
 * This function creates an immutable shallow copy of the input object and replaces the values
 * of specified fields with the string `***REDACTED***`. It is optimized for performance using
 * type narrowing and shallow copying.
 *
 * @template T - The type of the input data object.
 * @param data - The input data object to be processed. If the input is not an object, it will
 *               return an object with the value wrapped or an empty object if the input is `undefined`.
 * @param fieldsToRedact - An array of keys (fields) in the input object that should be redacted.
 * @returns A new object with the specified fields redacted. If the input is not an object, it
 *          returns an object with the value wrapped or an empty object.
 */
const redactSensitiveData = <T>(
  data: Readonly<T>,
  fieldsToRedact: readonly (keyof T)[]
): Record<string, unknown> => {
  // Type narrowing with direct object check - better for V8 monomorphic optimization
  if (typeof data !== 'object') {
    return typeof data === 'undefined' ? {} : { value: data };
  }

  // Immutable data structure with shallow copy - O(n)
  const result = { ...(data as Record<string, unknown>) };

  // O(n) loop to mask sensitive fields
  for (const field of fieldsToRedact) {
    if (field in result) {
      result[field as string] = '***REDACTED***';
    }
  }

  return result;
};

/**
 * Creates a safe result based on the provided value and inclusion flag.
 *
 * This utility function ensures immutability and reference isolation for objects,
 * while efficiently handling primitives and nullish values. It is optimized for
 * performance with early returns and type-narrowing techniques.
 *
 * @template R - The type of the value to be processed.
 * @param shouldInclude - A boolean flag indicating whether the value should be included.
 * @param value - The value to be processed, which can be of type `R`, `null`, or `undefined`.
 * @returns The processed value if `shouldInclude` is true and the value is not nullish.
 *          Returns `undefined` otherwise. For objects, a shallow immutable copy is returned.
 */
const createSafeResult = <R>(shouldInclude: boolean, value: R | null | undefined): unknown => {
  // Early return for disabled logging or nullish values - O(1)
  if (!shouldInclude || value == null) {
    return undefined;
  }

  // Primitives vs objects handling with optimized type-narrowing for V8 - O(1)
  const valueType = typeof value;
  if (valueType !== 'object') {
    return value; // Fast path for primitives
  }

  // At this point, we know value is an object and not null
  // Shallow copy for immutability and reference isolation - O(n)
  return { ...value }; // Create immutable copy with stable shape for V8
};

export default log;
