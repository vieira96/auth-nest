import { Injectable } from '@nestjs/common';
import type { User } from '@/generated/prisma/client';
import { PrismaService } from '@/shared/database/prisma/prisma.service';

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
  roleId: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(input: CreateUserInput): Promise<User> {
    return this.prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: input.passwordHash,
        roles: {
          create: {
            role: {
              connect: { id: input.roleId },
            },
          },
        },
      },
    });
  }
}
