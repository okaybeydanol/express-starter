// Express & Middleware
import { Router } from 'express';

// Parent Directory Imports
import { createUserController } from '../controllers/create-user.controller.js';
import { validatePasswordMatchMiddleware } from '../middlewares/password-validation.middleware.js';

/**
 * Defines the route configuration for user creation endpoints.
 *
 * This module sets up an Express router for handling user creation requests.
 * It includes the following route:
 *
 * - `POST /`: Creates a new user by invoking the `createUserController`.
 *
 * @module create-user.routes
 * @requires express.Router
 * @requires ../controllers/create-user.controller
 * @requires ../middlewares/password-validation.middleware
 *
 * @exports
 * - `path`: The base path for the user creation API (`/api/users/create`).
 * - `route`: The configured Express router instance.
 */

const createUserRouter = Router();

createUserRouter.post(
  '/',
  validatePasswordMatchMiddleware('password', 'passwordConfirm'),
  createUserController.createUser
);

// O(1) export with immutable configuration
export default Object.freeze({
  path: '/api/users/create',
  route: createUserRouter,
});
