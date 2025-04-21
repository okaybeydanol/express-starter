// Express & Middleware
import { Router } from 'express';

// Parent Directory Imports
import { updateUserByIdController } from '../controllers/update-user-by-id.controller.js';
import { validatePasswordMatchMiddleware } from '../middlewares/password-validation.middleware.js';

// Type Imports
import type { UpdateUserInput } from '../types/update-user-by-id.types.js';

/**
 * Defines the route configuration for user update endpoints.
 *
 * This module sets up an Express router for handling user update requests.
 * It includes the following route:
 *
 * - `PUT /:id`: Updates an existing user by invoking the `updateUserController`.
 *   Includes middleware for password validation when password update is requested.
 *
 * @module update-user.routes
 * @requires express.Router
 * @requires ../controllers/update-user-by-id.controller
 * @requires ../middlewares/password-validation.middleware
 *
 * @exports
 * - `path`: The base path for the user API (`/api/users`).
 * - `route`: The configured Express router instance.
 */

const updateUserByIdRouter = Router();

updateUserByIdRouter.put(
  '/:id',
  // Optional middleware for password validation when changing password
  (req, res, next) => {
    if (req.body.newPassword != null && req.body.newPasswordConfirm != null) {
      validatePasswordMatchMiddleware<UpdateUserInput>('newPassword', 'newPasswordConfirm')(
        req,
        res,
        next
      );
      return;
    }
    next();
  },
  updateUserByIdController.updateUser
);

// O(1) export with immutable configuration
export default Object.freeze({
  path: '/api/users',
  route: updateUserByIdRouter,
});
