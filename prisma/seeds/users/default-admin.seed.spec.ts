import { RoleName, type PrismaClient } from '@/generated/prisma/client';
import * as argon2 from 'argon2';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { seedDefaultAdmin } from './default-admin.seed';

vi.mock('argon2', () => ({
  argon2id: 2,
  hash: vi.fn(),
}));

const originalEnvironment = {
  name: process.env.ADMIN_NAME,
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
};

afterEach(() => {
  process.env.ADMIN_NAME = originalEnvironment.name;
  process.env.ADMIN_EMAIL = originalEnvironment.email;
  process.env.ADMIN_PASSWORD = originalEnvironment.password;
  vi.clearAllMocks();
});

describe('seedDefaultAdmin', () => {
  it('creates the default admin and assigns the ADMIN role', async () => {
    process.env.ADMIN_NAME = 'Admin User';
    process.env.ADMIN_EMAIL = 'Admin@Example.com';
    process.env.ADMIN_PASSWORD = 'safe-password';

    const adminRole = { id: 'role-admin', name: RoleName.ADMIN };
    const admin = { id: 'user-admin' };
    const prisma = {
      role: { findUnique: vi.fn().mockResolvedValue(adminRole) },
      user: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue(admin),
      },
      userRole: { upsert: vi.fn().mockResolvedValue(undefined) },
    } as unknown as PrismaClient;
    vi.mocked(argon2.hash).mockResolvedValue('argon2-hash');

    await seedDefaultAdmin(prisma);

    expect(argon2.hash).toHaveBeenCalledWith('safe-password', {
      type: argon2.argon2id,
    });
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        name: 'Admin User',
        email: 'admin@example.com',
        passwordHash: 'argon2-hash',
      },
    });
    expect(prisma.userRole.upsert).toHaveBeenCalledWith({
      where: {
        userId_roleId: { userId: 'user-admin', roleId: 'role-admin' },
      },
      update: {},
      create: { userId: 'user-admin', roleId: 'role-admin' },
    });
  });

  it('does not change the password of an existing admin', async () => {
    process.env.ADMIN_NAME = 'Admin User';
    process.env.ADMIN_EMAIL = 'admin@example.com';
    process.env.ADMIN_PASSWORD = 'new-password';

    const prisma = {
      role: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'role-admin',
          name: RoleName.ADMIN,
        }),
      },
      user: {
        findUnique: vi.fn().mockResolvedValue({ id: 'user-admin' }),
        create: vi.fn(),
      },
      userRole: { upsert: vi.fn().mockResolvedValue(undefined) },
    } as unknown as PrismaClient;

    await seedDefaultAdmin(prisma);

    expect(argon2.hash).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
  });
});
