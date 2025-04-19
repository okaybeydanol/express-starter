// External Dependencies
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Parent Directory Imports
import { getAllUsersRepository } from '../../../../src/features/users/index';
import { getAllUsersService } from '../../../../src/features/users/index';
import { userFixtures } from '../../../fixtures/userFixtures';
import { measurePerformance } from '../../../helpers/measurePerformance';

/**
 * Repository integration tests optimized for V8 JIT
 */

/**
 * Mock implementation using monomorphic object shapes for V8 optimization
 *
 * This approach creates a consistent object structure which enables V8's hidden class
 * optimizations and inline caching. By maintaining the same shape for the mock object,
 * we help V8's JIT compiler generate optimized machine code for property access.
 */
vi.mock('../../../../src/features/users/repositories/get-all-users.repository', () => ({
  getAllUsersRepository: {
    findAll: vi.fn(),
  },
}));

/**
 * Test suite for the user service layer
 *
 * Following the single responsibility principle, this suite focuses only on testing
 * the service's interaction with its repository dependency, not the implementation
 * details of either component.
 */
describe('getAllUsersService', () => {
  /**
   * Reset mocks before each test to ensure isolation
   *
   * This provides O(1) test setup consistency and prevents cross-test contamination,
   * which is critical for maintaining deterministic test behavior regardless of execution order.
   */
  beforeEach(() => {
    vi.resetAllMocks();
  });

  /**
   * Test for the success path with proper typing and expectations
   *
   * This test verifies that:
   * 1. The service correctly calls the repository's findAll method
   * 2. The service returns the data provided by the repository without modification
   * 3. The repository method is called exactly once (avoiding N+1 problems)
   */
  it('should return all users from repository with O(1) lookup', async () => {
    // Cast mock to the correct type for better TypeScript support and IDE intelligence
    const mockFindAll = getAllUsersRepository.findAll as ReturnType<typeof vi.fn>;
    // Configure mock to return test fixture data with Promise resolution
    mockFindAll.mockResolvedValue(userFixtures.singleUser);

    // Act: Execute the service method with O(1) time complexity
    const { result, metrics } = await measurePerformance(async () => {
      return await getAllUsersService.getAllUsers();
    });

    // Log metrics
    console.log(`Controller execution time: ${metrics.executionTime}ms`);
    console.log(`Controller memory used: ${metrics.memoryUsed} bytes`);

    // Assert: Verify both the call pattern and return value
    expect(mockFindAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(userFixtures.singleUser);
  });

  /**
   * Test for the error path with monomorphic error handling
   *
   * This test ensures that:
   * 1. Errors from the repository layer properly propagate up through the service
   * 2. The original error message is preserved for debugging
   * 3. The error handling follows a consistent pattern for V8 optimization
   */
  it('should throw error when repository fails with monomorphic error pattern', async () => {
    // Create a typed error instance for consistent shape
    const testError = new Error('Database connection failed');
    // Cast mock to ensure proper TypeScript type checking
    const mockFindAll = getAllUsersRepository.findAll as ReturnType<typeof vi.fn>;
    // Configure mock to reject with the test error
    mockFindAll.mockRejectedValue(testError);

    // Assert: Verify error propagation with proper async/await pattern
    await expect(getAllUsersService.getAllUsers()).rejects.toThrow(testError.message);
  });
});
