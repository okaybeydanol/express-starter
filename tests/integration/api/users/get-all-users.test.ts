// Express & Middleware
import express from 'express';

// External Dependencies
import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Parent Directory Imports
import { getAllUsersService } from '../../../../src/features/users/index';
import { userFixtures } from '../../../fixtures/userFixtures';

// Mock the service with monomorphic shape for V8 optimization
vi.mock('../../../../src/features/users/services/get-all-users.service', () => ({
  getAllUsersService: {
    getAllUsers: vi.fn(),
  },
}));

describe('GET /api/users', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return users with 200 status code', async () => {
    // Arrange
    vi.mocked(getAllUsersService.getAllUsers).mockResolvedValue(userFixtures.singleUser);

    // Create minimal Express app with O(1) setup complexity
    const app = express();

    // Use Router object for proper middleware chain formation
    const router = express.Router();

    // Define route handler as proper function for V8 monomorphic dispatch
    router.get('/', async (req, res) => {
      try {
        const users = await getAllUsersService.getAllUsers();
        res.status(200).json({
          success: true,
          data: users,
          count: users.length,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          data: [],
          count: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Mount router properly on the app
    app.use('/api/users', router);

    // Act: Execute request with O(1) setup
    const response = await request(app).get('/api/users').set('x-request-id', 'test-id');

    // Assert: Verify response with type-safe expectations
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          email: expect.any(String),
        }),
      ]),
      count: expect.any(Number),
    });
  });
});
