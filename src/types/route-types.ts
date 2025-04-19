// Type Imports
import type { Router } from 'express';

/**
 * Represents a route configuration object.
 *
 * @property path - The URL path for the route.
 * @property route - The Express Router instance associated with the route.
 */
export type IRoute = Readonly<{
  readonly path: string;
  readonly route: Router;
}>;

/**
 * Represents the configuration for the application.
 *
 * @property routes - A readonly array of route definitions (`IRoute`)
 *                    that the application will use.
 */
export type AppConfig = Readonly<{
  readonly routes: readonly IRoute[];
}>;
