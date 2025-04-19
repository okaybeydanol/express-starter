/**
 * Represents the health status of a system or service.
 *
 * - `'degraded'`: Indicates that the system is operational but experiencing reduced performance or partial issues.
 * - `'healthy'`: Indicates that the system is fully operational and functioning as expected.
 * - `'unhealthy'`: Indicates that the system is not operational or experiencing critical issues.
 */
export type HealthStatus = 'degraded' | 'healthy' | 'unhealthy';

/**
 * Represents the health status of a service.
 *
 * @property status - The current health status of the service.
 * @property details - Optional additional details about the service's health,
 *                     represented as a read-only record of key-value pairs.
 */
export type ServiceHealth = Readonly<{
  readonly status: HealthStatus;
  readonly details?: Readonly<Record<string, unknown>>;
}>;

/**
 * Represents the health status of the system, including its runtime metrics and service dependencies.
 */
export type SystemHealth = Readonly<{
  readonly status: HealthStatus;
  readonly uptime: number;
  readonly version: string;
  readonly memory: Readonly<{
    readonly rss: number; // MB
    readonly heapTotal: number; // MB
    readonly heapUsed: number; // MB
    readonly external: number; // MB
    readonly arrayBuffers: number; // MB
  }>;
  readonly cpu: Readonly<{
    readonly loadAvg: readonly number[];
    readonly cpuCount: number;
  }>;
  readonly services: Readonly<{
    readonly database: ServiceHealth;
    // readonly redis?: ServiceHealth; // Future Redis support can be added here
  }>;
}>;

/**
 * Parameters for retrieving the system health status.
 *
 * @property includeDetails - Optional. If true, includes detailed health information in the response.
 * @property timeoutMs - Optional. Specifies the timeout duration in milliseconds for the health check operation.
 */
export type GetSystemHealthParams = Readonly<{
  readonly includeDetails?: boolean;
  readonly timeoutMs?: number;
}>;

/**
 * Represents memory usage statistics of a Node.js process.
 *
 * @property rss - The Resident Set Size, which is the total memory allocated for the process execution, including code, stack, and heap.
 * @property heapTotal - The total size of the allocated heap.
 * @property heapUsed - The actual memory used during the execution of the process.
 * @property external - The memory used by C++ objects bound to JavaScript objects managed by V8.
 * @property arrayBuffers - The memory allocated for ArrayBuffer and SharedArrayBuffer objects.
 */
export type MemoryStats = Readonly<{
  readonly rss: number;
  readonly heapTotal: number;
  readonly heapUsed: number;
  readonly external: number;
  readonly arrayBuffers: number;
}>;
