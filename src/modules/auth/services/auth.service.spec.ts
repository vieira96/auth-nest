import { RoleName, type User } from '@/generated/prisma/client';
import { ConflictException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { RolesService } from '@/modules/roles/services/roles.service';
import { UsersService } from '@/modules/users/services/users.service';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';

vi.mock('argon2', () => ({
  argon2id: 2,
  hash: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('AuthService', () => {
  it('cadastra um usuário com a role USER e nunca retorna o hash da senha', async () => {
    const createdAt = new Date();

    const user: User = {
      id: 'user-id',
      name: 'Maria Silva',
      email: 'maria@example.com',
      passwordHash: 'argon2-hash',
      createdAt,
      updatedAt: createdAt,
    };

    const usersService = {
      findByEmail: vi.fn().mockResolvedValue(null),
      createUser: vi.fn().mockResolvedValue(user),
    } as unknown as UsersService;

    const rolesService = {
      findByName: vi.fn().mockResolvedValue({
        id: 'role-user',
        name: RoleName.USER,
      }),
    } as unknown as RolesService;

    vi.mocked(argon2.hash).mockResolvedValue('argon2-hash');

    const service = new AuthService(usersService, rolesService);

    await expect(
      service.register({
        name: 'Maria Silva',
        email: 'Maria@Example.com',
        password: 'strong-password',
      })
    ).resolves.toEqual({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt,
    });

    expect(argon2.hash).toHaveBeenCalledWith('strong-password', {
      type: argon2.argon2id,
    });

    expect(usersService.createUser).toHaveBeenCalledWith({
      name: 'Maria Silva',
      email: 'maria@example.com',
      passwordHash: 'argon2-hash',
      roleId: 'role-user',
    });
  });

  it('não cria um usuário quando o e-mail já existe', async () => {
    const usersService = {
      findByEmail: vi.fn().mockResolvedValue({ id: 'existing-user' }),
      createUser: vi.fn(),
    } as unknown as UsersService;

    const rolesService = {
      findByName: vi.fn(),
    } as unknown as RolesService;

    const service = new AuthService(usersService, rolesService);

    await expect(
      service.register({
        name: 'Maria Silva',
        email: 'maria@example.com',
        password: 'strong-password',
      }),
    ).rejects.toThrow(ConflictException);

    expect(argon2.hash).not.toHaveBeenCalled();

    expect(usersService.createUser).not.toHaveBeenCalled();
  });
});
