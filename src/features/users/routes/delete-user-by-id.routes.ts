// Express & Middleware
import { Router } from 'express';

// Parent Directory Imports
import { deleteUserByIdController } from '../controllers/delete-user-by-id.controller.js';

/**
 * Defines the route configuration for the `/api/users/:id` DELETE endpoint.
 *
 * This module sets up an Express router for handling user deletion requests.
 * It includes the following route:
 *
 * - `DELETE /users/:id`: Deletes a specific user by invoking the `deleteUserController`.
 *
 * @module delete-user.routes
 * @requires express.Router
 * @requires ../controllers/delete-user-by-id.controller
 *
 * @exports
 * - `path`: The base path for the user API (`/api/users`).
 * - `route`: The configured Express router instance.
 */

const deleteUserByIdRouter = Router();

deleteUserByIdRouter.delete('/:id', deleteUserByIdController.deleteUserById);

export default Object.freeze({
  path: '/api/users',
  route: deleteUserByIdRouter,
});
