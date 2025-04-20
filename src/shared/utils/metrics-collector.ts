// Type Imports
import type { MetricReturn } from '#shared/types/metrics-collector.types.js';

/**
 * Creates a metrics collector utility for tracking and managing performance metrics.
 *
 * The metrics collector provides methods to start and stop timers, record metrics,
 * retrieve specific metrics, retrieve all metrics, and clear all stored metrics.
 * It uses a `Map` internally for efficient O(1) operations on metric storage and retrieval.
 *
 * @returns An object with the following methods:
 * - `startTimer(key?: string): () => void` - Starts timing an operation and returns a function to stop the timer and record the elapsed time.
 * - `record(key?: string, value?: number): void` - Records a specific metric value directly.
 * - `getMetric(key?: string): number` - Retrieves the value of a specific metric by its key, or `0` if not found.
 * - `getAllMetrics(): Readonly<Record<string, number>>` - Retrieves all recorded metrics as an immutable object.
 * - `clear(): void` - Clears all stored metrics.
 */
const createMetricsCollector = (): MetricReturn => {
  // Use Map for O(1) lookup of metrics by key
  const metricsStore = new Map<string, number>();

  return {
    /**
     * Starts timing an operation with high-precision timer
     *
     * @param key - Identifier for the metric being timed
     * @returns Function that stops timing and records the result with O(1) complexity
     */
    startTimer: (key = 'queryTime'): (() => void) => {
      // O(1) fallback with early unboxing
      // performance.now() provides microsecond precision with O(1) complexity
      const startTime = performance.now();

      // Return a closure with reference to startTime for O(1) calculation
      return () => {
        const endTime = performance.now();
        const elapsedTime = endTime - startTime;
        // O(1) map insertion
        metricsStore.set(key, elapsedTime);
      };
    },

    /**
     * Records a metric value directly
     *
     * @param key - Identifier for the metric
     * @param value - Numeric value to record
     * @returns void - O(1) operation
     */
    record: (key = 'queryTime', value = 0): void => {
      metricsStore.set(key, value);
    },

    /**
     * Retrieves a specific metric by key
     *
     * @param key - Identifier for the metric
     * @returns The recorded metric value or undefined if not found - O(1) lookup
     */
    getMetric: (key = 'queryTime'): number => metricsStore.get(key) ?? 0,

    /**
     * Retrieves all metrics as an immutable record
     *
     * @returns Readonly copy of all metrics - O(n) complexity for the copy operation
     */
    getAllMetrics: (): Readonly<Record<string, number>> =>
      // Convert Map to plain object with O(n) complexity
      Object.freeze(Object.fromEntries(metricsStore.entries())),
    /**
     * Clears all metrics - O(1) operation
     */
    clear: (): void => {
      metricsStore.clear();
    },
  };
};

export default createMetricsCollector;

/**
 * Creates a new metrics object with updated value
 * Immutable operation with O(1) complexity
 *
 * @param currentMetrics - Existing metrics object or undefined
 * @param key - Metric key to update
 * @param value - New metric value
 * @returns New immutable metrics object
 */
export const updateMetrics = (
  currentMetrics: Record<string, number> | undefined,
  key: string,
  value: number | undefined
): Readonly<Record<string, number>> =>
  Object.freeze({
    ...(currentMetrics ?? {}),
    [key]: value ?? 0,
  });
