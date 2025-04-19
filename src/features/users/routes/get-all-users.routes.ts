// Express & Middleware
import { Router } from 'express';

// Parent Directory Imports
import { getAllUsersController } from '../controllers/get-all-users.controller.js';

/**
 * Defines the route configuration for the `/api/users` endpoint.
 *
 * This module sets up an Express router for handling user-related requests.
 * It includes the following route:
 *
 * - `GET /users`: Retrieves a list of all users by invoking the `getAllUsersController`.
 *
 * @module get-all-users.routes
 * @requires express.Router
 * @requires ../controllers/get-all-users.controller
 *
 * @exports
 * - `path`: The base path for the users API (`/api/users`).
 * - `route`: The configured Express router instance.
 */

// Router instance oluşturma
const usersRouter = Router();

// GET /users endpoint'i - tüm kullanıcıları listeler
usersRouter.get('/', getAllUsersController.getAllUsers);

export default {
  path: '/api/users',
  route: usersRouter,
};
