// External Dependencies
import { vi } from 'vitest';

// Type Imports
import type { Response } from 'express';

/**
 * Creates a mock Express response with consistent shape
 * Returns a monomorphic object with stable hidden class for V8 optimization
 *
 * @returns Mock Response with chainable methods for assertions
 */
export const createMockRes = () =>
  ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  }) as unknown as Response;
