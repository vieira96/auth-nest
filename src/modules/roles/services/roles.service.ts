import type { Role, RoleName } from '@/generated/prisma/client';
import { PrismaService } from '@/shared/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByName(name: RoleName): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: { name },
    });
  }
}
