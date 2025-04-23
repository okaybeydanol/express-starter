// Type Imports
import type { AppConfig } from '#types/route-types.js';

/**
 * The default configuration for the application.
 *
 * This constant defines the initial setup for the application, including
 * an empty array of routes. It is strongly typed as `AppConfig` and marked
 * as `const` to ensure immutability.
 */
export const DEFAULT_APP_CONFIG: AppConfig = {
  routes: [],
} as const;
