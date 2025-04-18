// External Dependencies
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Configuration
import { env } from '#config/env';

// Type Imports
import type { Logform } from 'winston';

type Format = Logform.Format;
type TransformableInfo = Logform.TransformableInfo;

const two = 2;

/**
 * Type-safe formatter for consistent log structure optimized for V8 engine
 */
const createLogFormatter = (): Format =>
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
    const metaString = hasMetadata ? `\n${JSON.stringify(meta, null, two)}` : '';

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
 * Transport for daily rotating log files
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

/**
 * Core winston logger instance with all configured transports
 */
const logger = createLogger({
  level: env.logging.level,
  silent: env.isTest, // Disable logs in test environment
  defaultMeta: { service: 'express-api' },
  format: format.combine(format.errors({ stack: true }), format.metadata()),
  transports: [
    // Always add console transport for development
    new transports.Console({
      format: consoleFormat,
    }),
  ],
});

// Add file transports only in development and production
if (!env.isTest) {
  logger.add(createFileTransport('info'));
  logger.add(createFileTransport('error'));
}

/**
 * Type for additional metadata that can be logged
 */
export type LogMetadata = Record<string, unknown>;

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
 * Higher-order function that wraps a function with logging
 * Logs entry, exit and any errors
 */
export const withLogging =
  <T, R>(
    fn: (arg: Readonly<T>) => Promise<R> | R,
    options: Readonly<{
      readonly name: string;
      readonly logArgs?: boolean;
      readonly logResult?: boolean;
    }>
  ): ((arg: Readonly<T>) => Promise<R>) =>
  async (arg: Readonly<T>): Promise<R> => {
    const { name, logArgs = false, logResult = false } = options;

    try {
      // Log function entry with immutable parameters
      log.debug(`Entering ${name}`, logArgs ? { args: arg } : undefined);

      // Execute function
      const result = await fn(arg);

      // Log successful execution
      log.debug(`Successfully executed ${name}`, logResult ? { result } : undefined);

      return result;
    } catch (error) {
      // Log error with full details
      log.error(`Error in ${name}: ${(error as Error).message}`, {
        error,
        args: logArgs ? arg : undefined,
      });

      // Re-throw the error to maintain the flow
      throw error;
    }
  };

export default log;
