import type { User } from '@/generated/prisma/client';
import { PrismaService } from '@/shared/database/prisma/prisma.service';
import { describe, expect, it, vi } from 'vitest';
import { UsersService } from './users.service';

describe('UsersService', () => {
  it('encontra um usuário pelo e-mail', async () => {
    const user: User = {
      id: 'a0c7548c-0d33-4b0d-b03a-61ff821df4a6',
      name: 'Maria Silva',
      email: 'maria@example.com',
      passwordHash: 'hash',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const findUnique = vi.fn().mockResolvedValue(user);
    const prisma = {
      user: { findUnique },
    } as unknown as PrismaService;
    const service = new UsersService(prisma);

    await expect(service.findByEmail(user.email)).resolves.toEqual(user);
    expect(findUnique).toHaveBeenCalledWith({ where: { email: user.email } });
  });
});
