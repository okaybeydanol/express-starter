// Express & Middleware
import { Router } from 'express';

// Shared Modules
import { jwtAuthMiddleware } from '#shared/middleware/jwt.middleware';

// Parent Directory Imports
import { createUserController } from '../controllers/create-user.controller.js';
import { deleteUserByIdController } from '../controllers/delete-user-by-id.controller.js';
import { getAllUsersController } from '../controllers/get-all-users.controller.js';
import { getUserByIdController } from '../controllers/get-user-by-id.controller.js';
import { updateUserByIdController } from '../controllers/update-user-by-id.controller.js';
import { validatePasswordMatchMiddleware } from '../middlewares/password-validation.middleware.js';

// Type Imports
import type { CreateUserInput } from '../types/create-user.types.js';
import type { UpdateUserInput } from '../types/update-user-by-id.types.js';

/**
 * Defines the route configuration for user endpoints.
 *
 * This module sets up an Express router for handling user requests.
 * It includes the following route:
 *
 * @module create-user.routes
 * @requires express.Router
 * @requires ../controllers/create-user.controller
 * @requires ../controllers/delete-user-by-id.controller
 * @requires ../controllers/get-all-users.controller
 * @requires ../controllers/get-user-by-id.controller
 * @requires ../controllers/update-user-by-id.controller
 * @requires ../controllers/middlewares/password-validation.middleware
 * @requires #shared/middleware/jwt.middleware
 *
 * @exports
 * - `path`: The base path for the user API (`/api/users`).
 * - `route`: The configured Express router instance.
 */

const userRoutes = Router();

userRoutes.post(
  '/',
  validatePasswordMatchMiddleware<CreateUserInput>('password', 'passwordConfirm'),
  createUserController.createUser
);
userRoutes.delete('/:id', jwtAuthMiddleware, deleteUserByIdController.deleteUserById);
userRoutes.get('/', jwtAuthMiddleware, getAllUsersController.getAllUsers);
userRoutes.get('/:id', jwtAuthMiddleware, getUserByIdController.getUserById);
userRoutes.put(
  '/',
  jwtAuthMiddleware,
  (req, res, next) => {
    const { role, newPassword, newPasswordConfirm } = req.body;
    if (role === 'USER' && newPassword != null && newPasswordConfirm != null) {
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
  route: userRoutes,
});
