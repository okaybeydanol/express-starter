// Prisma & DB
import { Prisma, PrismaClient, Role } from '@prisma/client';

// External Dependencies
import { faker } from '@faker-js/faker';
import { hash } from 'bcrypt';

type ImmutableUserCreateInput = Readonly<Omit<Prisma.UserCreateManyInput, 'id'>>;

const prisma = new PrismaClient();

const generateUsers = async (count: number): Promise<readonly ImmutableUserCreateInput[]> => {
  const adminPassword = await hash('admin123', 10);
  const userPassword = await hash('user123', 10);

  const fixedUsers = [
    {
      email: 'admin@example.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
    },
    {
      email: 'user@example.com',
      password: userPassword,
      firstName: 'Test',
      lastName: 'User',
      role: Role.USER,
    },
  ];

  const hashedPassword = await hash('password123', 10);

  const randomUsers = Array.from({ length: Math.max(0, count - 2) }).map(() => ({
    email: faker.internet.email().toLowerCase(),
    password: hashedPassword,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    role: Role.USER,
  }));

  return [...fixedUsers, ...randomUsers];
};

const seed = async (): Promise<void> => {
  try {
    console.log('🌱 Seeding database...');

    await prisma.user.deleteMany();

    const USER_COUNT = 20;

    const users = await generateUsers(USER_COUNT);

    await prisma.user.createMany({
      data: [...users],
      skipDuplicates: true,
    });

    const userCount = await prisma.user.count();
    console.log(`✅ Seed completed successfully! Created ${userCount} users.`);
  } catch (error) {
    console.error('❌ Seed failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

void (async (): Promise<void> => {
  try {
    await seed();
  } catch (error) {
    console.error('Fatal error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
})();
