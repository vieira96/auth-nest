import * as argon2 from 'argon2';
import { RoleName, type PrismaClient } from '@/generated/prisma/client';

function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} não foi definida.`);
  }

  return value;
}

export async function seedDefaultAdmin(prisma: PrismaClient): Promise<void> {
  const name = requiredEnvironmentVariable('ADMIN_NAME');
  const email = requiredEnvironmentVariable('ADMIN_EMAIL').toLowerCase();
  const password = requiredEnvironmentVariable('ADMIN_PASSWORD');

  const adminRole = await prisma.role.findUnique({
    where: { name: RoleName.ADMIN },
  });

  if (!adminRole) {
    throw new Error('A role ADMIN não foi encontrada.');
  }

  let admin = await prisma.user.findUnique({
    where: { email },
  });

  if (!admin) {
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    admin = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });
  }

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: admin.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      roleId: adminRole.id,
    },
  });
}
