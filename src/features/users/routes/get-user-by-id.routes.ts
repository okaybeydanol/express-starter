// Express & Middleware
import { Router } from 'express';

// Parent Directory Imports
import { getUserByIdController } from '../controllers/get-user-by-id.controller.js';

/**
 * Defines the route configuration for the `/api/users/:id` endpoint.
 *
 * This module sets up an Express router for handling user-related requests.
 * It includes the following route:
 *
 * - `GET /users/:id`: Retrieves a specific user by invoking the `getUserByIdController`.
 *
 * @module get-user-by-id.routes
 * @requires express.Router
 * @requires ../controllers/get-user-by-id.controller
 *
 * @exports
 * - `path`: The base path for the user detail API (`/api/users`).
 * - `route`: The configured Express router instance.
 */

const getUserByIdRouter = Router();

getUserByIdRouter.get('/:id', getUserByIdController.getUserById);

export default Object.freeze({
  path: '/api/users',
  route: getUserByIdRouter,
});
