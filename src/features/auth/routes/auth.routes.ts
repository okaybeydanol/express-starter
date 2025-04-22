// Express & Middleware
import { Router } from 'express';

// Parent Directory Imports
import { jwtAuthMiddleware } from '../../../shared/middleware/jwt.middleware.js';
import { loginController } from '../controllers/login.controller.js';
import { logoutController } from '../controllers/logout.controller.js';
import { refreshTokenController } from '../controllers/refresh-token.controller.js';

/**
 * Express router configuration for authentication endpoints.
 *
 * Uses functional approach with pure routing definitions.
 * Routes follow RESTful API design principles.
 *
 * O(1) routing complexity with Express router
 */
const authRouter = Router();

// Public routes (no auth required)
authRouter.post('/login', loginController.login);
authRouter.post('/refresh', refreshTokenController.refreshToken);

// Protected routes (auth required)
authRouter.post('/logout', jwtAuthMiddleware, logoutController.logout);

// O(1) export with immutable configuration
export default Object.freeze({
  path: '/api/auth',
  route: authRouter,
});
