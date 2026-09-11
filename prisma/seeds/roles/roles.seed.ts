import { RoleName, type PrismaClient } from '@/generated/prisma/client';

export async function seedRoles(prisma: PrismaClient): Promise<void> {
  await prisma.role.createMany({
    data: [{ name: RoleName.ADMIN }, { name: RoleName.USER }],
    skipDuplicates: true,
  });
}
