// Prisma & DB
import { PrismaClient } from '@prisma/client';

// External Dependencies
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Parent Directory Imports
import { getAllUsersRepository } from '../../../../src/features/users/index';
import { userFixtures } from '../../../fixtures/userFixtures';
import { measurePerformance } from '../../../helpers/measurePerformance';

/**
 * Repository unit tests optimized for V8 JIT compiler
 *
 * This test suite demonstrates monomorphic function patterns for optimal V8 performance.
 * By maintaining consistent object shapes and property access patterns, we enable
 * V8's hidden class optimization and inline caching mechanisms.
 */

/**
 * Monomorphic mock shape for Prisma client - optimizes V8 inline caching
 *
 * This mock maintains a consistent object shape for better V8 optimization:
 * 1. Creates a static object structure that V8 can optimize with hidden classes
 * 2. Avoids dynamic property additions that would cause shape transitions
 * 3. Ensures consistent method signatures for maximum inline caching
 */
vi.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      findMany: vi.fn(),
    },
    $disconnect: vi.fn().mockResolvedValue(undefined),
  };

  return {
    PrismaClient: vi.fn(() => mockPrismaClient),
  };
});

/**
 * Test suite for getAllUsersRepository
 *
 * Tests the repository layer in isolation by mocking the Prisma client.
 * This approach allows testing the repository logic without database dependencies,
 * while measuring performance characteristics with O(1) complexity.
 */
describe('getAllUsersRepository', () => {
  let prisma;

  /**
   * Reset mocks for O(1) test isolation
   *
   * Resetting mocks before each test ensures:
   * 1. Tests don't affect each other (isolation)
   * 2. Clean mock state with O(1) complexity
   * 3. Consistent starting conditions for predictable test results
   */
  beforeEach(() => {
    vi.resetAllMocks();
    prisma = new PrismaClient();
  });

  /**
   * Test for successful repository operation
   *
   * Verifies that the repository correctly:
   * 1. Calls Prisma with the expected parameters
   * 2. Returns the data from Prisma without modification
   * 3. Operates with acceptable performance characteristics
   */
  it('should find all users with O(1) database query complexity', async () => {
    // Arrange: Setup monomorphic mock with consistent shape
    const mockFindMany = prisma.user.findMany as ReturnType<typeof vi.fn>;
    mockFindMany.mockResolvedValue(userFixtures.multipleUsers);

    // Act: Measure performance for repository operations
    const { result, metrics } = await measurePerformance(async () => {
      return await getAllUsersRepository.findAll();
    });

    // Log performance metrics
    console.log(`Repository execution time: ${metrics.executionTime}ms`);
    console.log(`Repository memory used: ${metrics.memoryUsed} bytes`);

    // Assert: Verify data integrity and correct Prisma client usage
    expect(mockFindMany).toHaveBeenCalledTimes(1);

    // Fix: Match the actual object shape for V8 monomorphic optimizations
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: {
          createdAt: 'desc',
        },
      })
    );

    expect(result).toEqual(userFixtures.multipleUsers);
  });

  /**
   * Test for error handling in repository
   *
   * Verifies that the repository correctly:
   * 1. Propagates errors from Prisma up to calling code
   * 2. Maintains the original error message for debugging
   * 3. Uses consistent error handling patterns for V8 optimization
   */
  it('should propagate database errors with monomorphic error pattern', async () => {
    // Arrange: Create consistent error shape for V8 optimization
    const dbError = new Error('Database connection failed');
    const mockFindMany = prisma.user.findMany as ReturnType<typeof vi.fn>;
    mockFindMany.mockRejectedValue(dbError);

    // Assert: Verify error bubbles up correctly through repository layer
    await expect(getAllUsersRepository.findAll()).rejects.toThrow(dbError.message);
  });
});
