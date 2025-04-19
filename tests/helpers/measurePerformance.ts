/**
 * Measures execution time and memory usage of a function with O(1) complexity
 * Returns execution metrics for performance analysis
 *
 * @param fn - Function to measure
 * @returns Performance metrics object with execution time and memory usage
 */
export const measurePerformance = async <T>(
  fn: () => Promise<T> | T
): Promise<{
  result: T;
  metrics: {
    executionTime: number;
    memoryUsed: number;
  };
}> => {
  const memoryBefore = process.memoryUsage().heapUsed;
  const startTime = performance.now();

  const result = await fn();

  const endTime = performance.now();
  const memoryAfter = process.memoryUsage().heapUsed;

  return {
    result,
    metrics: {
      executionTime: endTime - startTime,
      memoryUsed: memoryAfter - memoryBefore,
    },
  };
};
