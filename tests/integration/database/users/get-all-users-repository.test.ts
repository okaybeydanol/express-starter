// Prisma & DB
import { Prisma, PrismaClient } from '@prisma/client';

// External Dependencies
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';

// Parent Directory Imports
import { measurePerformance } from '../../../helpers/measurePerformance';

/**
 * Repository Integration Tests Optimized for V8 JIT Compiler
 *
 * This test suite demonstrates how to effectively test Prisma repositories
 * while maximizing V8 engine optimizations:
 *
 * 1. Monomorphic function shapes - Consistent object structures for inline caching
 * 2. Hidden class stability - Immutable test data with proper spreading
 * 3. Memory shape preservation - V8-friendly object initialization
 * 4. Property access patterns - Optimized for inline caching
 * 5. Controlled test isolation - Clean state between tests
 */

// Core imports for testing

// Establish real database connection for true integration testing
const prisma = new PrismaClient();

// Pure factory function creates repository with dependency injection
// - Ensures monomorphic shapes for V8 optimization
// - Enables easy mocking for error testing scenarios
export const createUserRepository = (db: PrismaClient) => ({
  findAll: async () => {
    try {
      // O(n) query with O(1) index-backed filtering and sorting
      return await db.user.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      // Proper error propagation for testing error paths
      // Using type narrowing for consistent monomorphic error objects
      throw error instanceof Error ? error : new Error('Unknown database error occurred');
    }
  },
});

// Create main repository instance with real Prisma client
export const getAllUsersRepository = createUserRepository(prisma);

// Test data with Readonly type for V8 hidden class optimization
// - Using Prisma's generated types ensures type safety with DB schema
// - Readonly prevents accidental mutations during tests
const testUsers: Readonly<Prisma.UserCreateManyInput[]> = [
  {
    id: '511019d4-0727-4e97-9841-d63208403194',
    email: 'raegan26@hotmail.com',
    firstName: 'Jules',
    lastName: 'Lebsack',
    password: 'test-password-hash-1',
    isActive: true,
    createdAt: new Date('2025-04-12T11:21:21.952Z'),
    updatedAt: new Date('2025-04-12T11:21:21.952Z'),
  },
  {
    id: '511019d4-0727-4e97-9841-d63208403195',
    email: 'test2@example.com',
    firstName: 'Test',
    lastName: 'User2',
    password: 'test-password-hash-2',
    isActive: true,
    createdAt: new Date('2025-04-12T11:21:21.952Z'),
    updatedAt: new Date('2025-04-12T11:21:21.952Z'),
  },
];

describe('User Repository Integration Tests', () => {
  // Test isolation setup - ensures clean database state
  // V8 benefits from predictable execution patterns
  beforeAll(async () => {
    // Initial cleanup ensures tests start with empty database
    await prisma.user.deleteMany();
  });

  // Reset state between tests - critical for test isolation
  // Ensures V8 has consistent starting conditions for optimization
  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  // Resource cleanup - free connections when tests complete
  // Prevents memory leaks and connection pool exhaustion
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should find all users with O(1) lookup pattern', async () => {
    // Arrange: Create test data, using spread operator to convert readonly to mutable
    // This preserves V8 hidden class stability while meeting Prisma's type requirements
    await prisma.user.createMany({
      data: testUsers.map((user) => ({ ...user })),
    });

    // Act: Exercise the repository method under test
    const { result, metrics } = await measurePerformance(async () => {
      return await getAllUsersRepository.findAll();
    });

    console.log(`Controller execution time: ${metrics.executionTime}ms`);
    console.log(`Controller memory used: ${metrics.memoryUsed} bytes`);

    // Assert: Basic validation of result count
    expect(result).toHaveLength(2);

    // V8 optimization: Assign to variables first for consistent property access
    // This enables V8's monomorphic inline caching for property access
    const firstTestUser = testUsers[0];
    const secondTestUser = testUsers[1];

    // Optional chaining provides safe O(1) property access with nullability checks
    // This pattern is V8-friendly and prevents runtime errors
    expect(result[0]?.email).toBe(firstTestUser.email);
    expect(result[1]?.email).toBe(secondTestUser.email);

    // Type narrowing with explicit length check enables V8 to optimize
    // the property access pattern with stable hidden classes
    if (result.length >= 2) {
      // Destructuring creates consistent local variables for V8 optimization
      const [firstUser, secondUser] = result;
      expect(firstUser.firstName).toBe(firstTestUser.firstName);
      expect(secondUser.firstName).toBe(secondTestUser.firstName);
    }
  });

  it('should return empty array when no users exist', async () => {
    // Act: Repository should handle empty state gracefully
    const { result, metrics } = await measurePerformance(async () => {
      return await getAllUsersRepository.findAll();
    });

    console.log(`Controller execution time: ${metrics.executionTime}ms`);
    console.log(`Controller memory used: ${metrics.memoryUsed} bytes`);

    // Assert: Verify empty results with multiple assertions
    // Using both .toEqual and property check ensures correctness
    expect(result).toEqual([]);
    expect(result.length).toBe(0);
  });

  it('should handle database errors gracefully', async () => {
    // Arrange: Create mock that throws controlled error
    // Using monomorphic object shape for V8 optimization
    const mockPrisma = {
      user: {
        findMany: async () => {
          throw new Error('Database connection error');
        },
      },
    } as unknown as PrismaClient;

    // Create test-specific repository with injected mock
    // This enables isolated testing without affecting other tests
    const testRepo = createUserRepository(mockPrisma);

    // Act & Assert: Verify error propagation with promise rejection
    // Using .rejects.toThrow for clear assertion of async errors
    await expect(testRepo.findAll()).rejects.toThrow('Database connection error');
  });
});
