// Parent Directory Imports
import { getAllUsersRepository } from '../repositories/get-all-users.repository.js';

// Type Imports
import type { UserResponse } from '../types/get-all-users.types.js';

/**
 * Service for retrieving all users.
 *
 * This service provides a method to fetch all users from the repository.
 * It returns a promise that resolves to a readonly array of user responses.
 */
export const getAllUsersService = {
  /**
   * Retrieves all users from the repository.
   *
   * @returns A promise that resolves to a readonly array of user responses.
   */
  getAllUsers: async (): Promise<readonly UserResponse[]> => await getAllUsersRepository.findAll(),
};
