import { Injectable } from '@nestjs/common';
import type { User } from '@/generated/prisma/client';
import { PrismaService } from '@/shared/database/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}
