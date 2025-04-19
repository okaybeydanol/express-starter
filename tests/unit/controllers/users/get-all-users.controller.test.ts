// External Dependencies
import { describe, it, expect, vi } from 'vitest';

// Parent Directory Imports
import { getAllUsersController } from '../../../../src/features/users/index';
import { getAllUsersService } from '../../../../src/features/users/index';
import { HTTP_STATUS_CODE } from '../../../../src/shared/constants/http-status-codes';
import { userFixtures } from '../../../fixtures/userFixtures';
import { measurePerformance } from '../../../helpers/measurePerformance';
import { createMockReq } from '../../../helpers/request-factory';
import { createMockRes } from '../../../helpers/response-factory';

/**
 * Unit tests for the getAllUsersController
 *
 * These tests validate the controller's behavior in success and failure scenarios
 * using monomorphic mock objects to ensure V8 JIT optimization.
 */

// Import helpers and fixtures for O(1) access patterns

// Mock with consistent shape for V8 monomorphic optimization
vi.mock('../../../../src/features/users/services/get-all-users.service', () => ({
  getAllUsersService: {
    getAllUsers: vi.fn(),
  },
}));

describe('getAllUsersController.getAllUsers', () => {
  it('should return users with 200 status code when successful', async () => {
    // Arrange: Use fixture with consistent shapes for V8 hidden class stability
    const mockReq = createMockReq();
    const mockRes = createMockRes();

    // Mock service with O(1) complexity
    vi.mocked(getAllUsersService.getAllUsers).mockResolvedValue(userFixtures.singleUser);

    // Act: Invoke controller with awaited Promise
    const { result, metrics } = await measurePerformance(async () => {
      await getAllUsersController.getAllUsers(mockReq, mockRes);
      return mockRes;
    });

    // Log metrics
    console.log(`Controller execution time: ${metrics.executionTime}ms`);
    console.log(`Controller memory used: ${metrics.memoryUsed} bytes`);

    // Assert: Verify response with type-safe expectations
    expect(result.status).toHaveBeenCalledWith(HTTP_STATUS_CODE.OK);
    expect(result.json).toHaveBeenCalledWith({
      success: true,
      data: userFixtures.singleUser,
      count: userFixtures.singleUser.length,
    });
  });

  it('should return error with 500 status code when service fails', async () => {
    // Arrange: Setup error scenario with consistent error shape
    const mockReq = createMockReq();
    const mockRes = createMockRes();

    // Mock service failure with O(1) rejection
    vi.mocked(getAllUsersService.getAllUsers).mockRejectedValue(userFixtures.serviceError);

    // Act: Execute controller with proper async handling
    const { result, metrics } = await measurePerformance(async () => {
      await getAllUsersController.getAllUsers(mockReq, mockRes);
      return mockRes;
    });

    // Log metrics
    console.log(`Controller execution time: ${metrics.executionTime}ms`);
    console.log(`Controller memory used: ${metrics.memoryUsed} bytes`);

    // Assert: Verify error structure
    expect(result.status).toHaveBeenCalledWith(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR);
    expect(result.json).toHaveBeenCalledWith({
      success: false,
      data: [],
      count: 0,
      error: expect.any(String),
    });
  });

  it('should handle empty user array with 200 status code', async () => {
    // Arrange: Test edge case with empty array
    const mockReq = createMockReq();
    const mockRes = createMockRes();

    // Mock service with O(1) resolution to empty array
    vi.mocked(getAllUsersService.getAllUsers).mockResolvedValue(userFixtures.emptyList);

    // Act: Execute controller
    const { result, metrics } = await measurePerformance(async () => {
      await getAllUsersController.getAllUsers(mockReq, mockRes);
      return mockRes;
    });

    // Log metrics
    console.log(`Controller execution time: ${metrics.executionTime}ms`);
    console.log(`Controller memory used: ${metrics.memoryUsed} bytes`);

    // Assert: Verify consistent successful response with empty data
    expect(result.status).toHaveBeenCalledWith(HTTP_STATUS_CODE.OK);
    expect(result.json).toHaveBeenCalledWith({
      success: true,
      data: [],
      count: 0,
    });
  });

  it('should properly handle custom request headers', async () => {
    // Arrange: Test with extended request metadata
    const customHeaders = {
      'x-request-id': 'custom-trace-id',
      'x-correlation-id': 'workflow-123',
      'user-agent': 'Test-Suite/1.0',
    };
    const mockReq = createMockReq(customHeaders);
    const mockRes = createMockRes();

    // Mock service with expected data
    vi.mocked(getAllUsersService.getAllUsers).mockResolvedValue(userFixtures.testUser);

    // Act: Execute controller with enhanced request
    const { result, metrics } = await measurePerformance(async () => {
      await getAllUsersController.getAllUsers(mockReq, mockRes);
      return mockRes;
    });

    // Log metrics
    console.log(`Controller execution time: ${metrics.executionTime}ms`);
    console.log(`Controller memory used: ${metrics.memoryUsed} bytes`);

    // Assert: Verify controller handles extended metadata correctly
    expect(result.status).toHaveBeenCalledWith(HTTP_STATUS_CODE.OK);
    expect(result.json).toHaveBeenCalledWith({
      success: true,
      data: userFixtures.testUser,
      count: userFixtures.testUser.length,
    });
  });
});
