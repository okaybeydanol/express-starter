/**
 * User test fixtures with consistent shapes for V8 optimization
 * Provides reusable test data across all user-related tests
 */
export const userFixtures = {
  // Single user with complete profile
  singleUser: [
    {
      id: '511019d4-0727-4e97-9841-d63208403194',
      email: 'raegan26@hotmail.com',
      firstName: 'Jules',
      lastName: 'Lebsack',
      isActive: true,
      createdAt: new Date('2025-04-12T11:21:21.952Z'),
      updatedAt: new Date('2025-04-12T11:21:21.952Z'),
    },
  ] as const,

  // Test user with different values for custom scenarios
  testUser: [
    {
      id: '511019d4-0727-4e97-9841-d63208403194',
      email: 'user@example.com',
      firstName: 'Test',
      lastName: 'User',
      isActive: true,
      createdAt: new Date('2025-04-12T11:21:21.952Z'),
      updatedAt: new Date('2025-04-12T11:21:21.952Z'),
    },
  ] as const,

  // Empty array for zero-results tests
  emptyList: [] as const,

  // Error object with consistent shape
  serviceError: new Error('Service failed'),

  multipleUsers: [
    {
      id: '511019d4-0727-4e97-9841-d63208403194',
      email: 'raegan26@hotmail.com',
      firstName: 'Jules',
      lastName: 'Lebsack',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '622019d4-0727-4e97-9841-d63208403195',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '733019d4-0727-4e97-9841-d63208403196',
      email: 'sarah.smith@example.com',
      firstName: 'Sarah',
      lastName: 'Smith',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ] as const,
};
