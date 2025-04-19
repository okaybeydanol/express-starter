// Sibling Directory Imports
import log from './observability/logger.js';

// Type Imports
import type { MemoryStats } from '#types/health-check-types.js';
import type { LogMetadata } from '#types/with-logging-types.js';
import type { Request, Response, NextFunction } from 'express';

/* eslint-disable no-restricted-globals */
/**
 * Retrieves the system uptime in seconds.
 *
 * @returns {number} The number of seconds the current Node.js process has been running.
 */
export const getUptime = (): number => process.uptime();

/**
 * Retrieves the current memory usage statistics of the Node.js process.
 *
 * @returns {MemoryStats} An object containing memory usage details:
 * - `rss`: Resident Set Size, the portion of the process's memory held in RAM.
 * - `heapTotal`: Total size of the allocated heap.
 * - `heapUsed`: Actual memory used during the execution of the process.
 * - `external`: Memory used by C++ objects bound to JavaScript objects.
 * - `arrayBuffers`: Memory allocated for ArrayBuffer and SharedArrayBuffer.
 *
 * The returned object is immutable.
 */
export const getMemoryUsage = (): MemoryStats => {
  const memUsage = process.memoryUsage();

  return Object.freeze({
    rss: memUsage.rss,
    heapTotal: memUsage.heapTotal,
    heapUsed: memUsage.heapUsed,
    external: memUsage.external,
    arrayBuffers: memUsage.arrayBuffers,
  });
};

/**
 * Middleware function to log incoming HTTP requests.
 *
 * @param req - The incoming HTTP request object.
 * @param _res - The outgoing HTTP response object (unused in this middleware).
 * @param next - The callback to pass control to the next middleware function.
 *
 * Logs metadata about the request, including the IP address, HTTP method,
 * request path, query parameters, and request body. The log is recorded
 * at the HTTP log level.
 */
export const logRequest = (req: Request, _res: Response, next: NextFunction): void => {
  const meta: Readonly<LogMetadata> = {
    ip: req.ip,
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
  };
  log.http(`Incoming request: ${req.method} ${req.path}`, meta);
  next();
};
