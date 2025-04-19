// External Dependencies
import { PrismaClient } from '@prisma/client/extension';
import { vi } from 'vitest';

/**
 * A mock implementation of the `PrismaClient` for testing purposes.
 *
 * This mock object provides stubbed methods for the `user` model, allowing
 * you to simulate database operations without interacting with a real database.
 *
 * The following methods are mocked using `vi.fn()`:
 * - `findMany`: Simulates retrieving multiple user records.
 * - `findUnique`: Simulates retrieving a single user record by a unique identifier.
 * - `create`: Simulates creating a new user record.
 * - `update`: Simulates updating an existing user record.
 * - `delete`: Simulates deleting a user record.
 *
 * @type {PrismaClient}
 */
export const prismaMock = {
  user: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
} as unknown as PrismaClient;
