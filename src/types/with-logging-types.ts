// Type Imports
import type { Logform } from 'winston';

/**
 * Represents a readonly record of metadata for logging purposes.
 *
 * @typeParam string - The keys of the record, which are strings.
 * @typeParam unknown - The values of the record, which can be of any type.
 */
export type LogMetadata = Readonly<Record<string, unknown>>;

/**
 * Represents the format configuration for logging.
 * This type is typically used to define the structure or format
 * of log messages in a logging system.
 *
 * @see {@link https://github.com/winstonjs/logform | Logform Documentation}
 */
export type Format = Logform.Format;
/**
 * Represents the structure of log information that can be transformed.
 * This type is typically used in logging libraries to define the shape
 * of the log data that can be manipulated or formatted before being output.
 *
 * @see {@link https://github.com/winstonjs/logform#readme | Logform Documentation}
 */
export type TransformableInfo = Logform.TransformableInfo;

/**
 * Represents logging options that can be applied to a specific type `T`.
 *
 * @template T - The type of the object for which logging options are defined.
 *
 * @property name - A unique name to identify the logging context.
 * @property logArgs - Indicates whether the arguments of the function should be logged. Defaults to `false` if not specified.
 * @property logResult - Indicates whether the result of the function should be logged. Defaults to `false` if not specified.
 * @property logLevel - Specifies the log level to be used. Can be one of `'debug'`, `'http'`, or `'info'`.
 * @property redactFields - An array of field names (keys of `T`) that should be redacted in the logs to protect sensitive information (e.g., PII).
 * @property shouldLog - A function that determines whether logging should occur based on the provided argument of type `T`.
 *                       Returns `true` to enable logging or `false` to disable it.
 */
export type WithLoggingOptions<T> = Readonly<{
  readonly name: string;
  readonly logArgs?: boolean;
  readonly logResult?: boolean;
  readonly logLevel?: LogLevel;
  readonly redactFields?: readonly (keyof T)[];
  readonly shouldLog?: (arg: Readonly<T>) => boolean;
}>;

/**
 * Represents the logging levels available for the application.
 *
 * @remarks
 * This type defines the severity or importance of log messages.
 * It can be used to filter or categorize logs based on their level.
 *
 * @example
 * ```typescript
 * const logLevel: LogLevel = 'info';
 * ```
 *
 * @see {@link https://en.wikipedia.org/wiki/Log_level | Log Level Documentation}
 */
export type LogLevel = 'debug' | 'error' | 'http' | 'info' | 'warn';

/**
 * Represents metadata about the execution of a process or function.
 * This type is a union of two possible shapes:
 *
 * 1. An object containing the execution time in milliseconds (`executionTimeMs`)
 *    and no result (`result` is explicitly absent).
 * 2. An object containing the execution time in milliseconds (`executionTimeMs`)
 *    and a result of type `unknown`.
 *
 * @property executionTimeMs - The time taken for execution in milliseconds.
 * @property result - The result of the execution, if available. If this property
 *                    is present, it will contain a value of type `unknown`.
 *                    If absent, it indicates that no result is available.
 */
export type ExecutionMetadata =
  | {
      readonly executionTimeMs: number;
      readonly result?: never;
    }
  | {
      readonly result: unknown;
      readonly executionTimeMs: number;
    };

/**
 * Represents the parameters for logging operations.
 *
 * This type can either be:
 * - An object containing a readonly `args` property, which is a record of key-value pairs
 *   where the keys are strings and the values are of type `unknown`.
 * - Or `undefined`, indicating that no logging parameters are provided.
 */
export type LogParams =
  | {
      readonly args: Record<string, unknown> | undefined;
    }
  | undefined;
