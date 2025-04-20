/**
 * Interface representing a metrics collector for tracking and managing metrics.
 */
export interface MetricsCollector {
  /**
   * Starts a timer for a specific metric key. Returns a function to stop the timer.
   *
   * @param key - (Optional) The key associated with the timer. If not provided, a default key may be used.
   * @returns A function that stops the timer and records the elapsed time.
   */
  readonly startTimer: (key?: string) => () => void;

  /**
   * Records a value for a specific metric key.
   *
   * @param key - (Optional) The key associated with the metric. If not provided, a default key may be used.
   * @param value - (Optional) The value to record for the metric. If not provided, a default value may be used.
   */
  readonly record: (key?: string, value?: number) => void;

  /**
   * Retrieves the value of a specific metric by its key.
   *
   * @param key - (Optional) The key associated with the metric. If not provided, a default key may be used.
   * @returns The value of the metric associated with the given key.
   */
  readonly getMetric: (key?: string) => number;

  /**
   * Retrieves all recorded metrics as a read-only record.
   *
   * @returns A read-only record containing all metric keys and their associated values.
   */
  readonly getAllMetrics: () => Readonly<Record<string, number>>;

  /**
   * Clears all recorded metrics.
   */
  readonly clear: () => void;
}

// Backward compatibility for existing code
export type MetricReturn = MetricsCollector;
