// External Dependencies
import { vi } from 'vitest';

/**
 * Mocked user service with consistent shapes for V8 monomorphic dispatch
 * Maintains hidden class stability for optimal JIT compilation
 */
export const mockUserService = {
  getAllUsers: vi.fn(),
  getUserById: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
};

/**
 * Setup mock for successful user retrieval
 * @param users - User data to return
 */
export const mockGetAllUsersSuccess = (users: any) => {
  mockUserService.getAllUsers.mockResolvedValue(users);
};

/**
 * Setup mock for failed user retrieval
 * @param error - Error to throw
 */
export const mockGetAllUsersFailed = (error: Error) => {
  mockUserService.getAllUsers.mockRejectedValue(error);
};
