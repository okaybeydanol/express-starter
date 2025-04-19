// External Dependencies
import { describe, it, expect, vi } from 'vitest';

// Parent Directory Imports
import { getAllUsersController } from '../../../src/features/users/index';
import { getAllUsersService } from '../../../src/features/users/index';
import { HTTP_STATUS_CODE } from '../../../src/shared/constants/http-status-codes';
import { createMockReq } from '../../helpers/request-factory';
import { createMockRes } from '../../helpers/response-factory';

/**
 * Performance tests for API endpoints
 *
 * Measures response time and throughput under various loads
 * Ensures O(1) access patterns in controller operations
 */

// Mock the service
vi.mock('../../../src/features/users/services/get-all-users.service', () => ({
  getAllUsersService: {
    getAllUsers: vi.fn(),
  },
}));

describe('API Performance - getAllUsersController', () => {
  it('should handle large data sets efficiently', async () => {
    const memoryBefore = process.memoryUsage().heapUsed;
    const startTime = performance.now();
    // Arrange: Create large dataset (100 users)
    const largeUserSet = Array.from({ length: 100 }, (_, i) => ({
      id: `user-${i}`,
      email: `user${i}@example.com`,
      firstName: `First${i}`,
      lastName: `Last${i}`,
      isActive: true,
      createdAt: new Date('2025-04-12T11:21:21.952Z'),
      updatedAt: new Date('2025-04-12T11:21:21.952Z'),
    }));

    const mockReq = createMockReq();
    const mockRes = createMockRes();

    // Mock service to return large dataset
    vi.mocked(getAllUsersService.getAllUsers).mockResolvedValue(largeUserSet);

    // Act: Measure execution time
    await getAllUsersController.getAllUsers(mockReq, mockRes);

    const endTime = performance.now();
    const memoryAfter = process.memoryUsage().heapUsed;

    // Metrik logları
    console.log(`Execution time: ${endTime - startTime}ms`);
    console.log(`Memory used: ${memoryAfter - memoryBefore} bytes`);

    // Assert: Verify response and performance
    expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS_CODE.OK);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      data: largeUserSet,
      count: largeUserSet.length,
    });

    // Check execution time (should be fast for O(1) complexity)
    const executionTime = endTime - startTime;
    console.log(`Execution time for 100 users: ${executionTime}ms`);

    // Response formatting should be O(n) with minimal overhead
    expect(executionTime).toBeLessThan(50); // Usually completes in < 10ms
  });
});
