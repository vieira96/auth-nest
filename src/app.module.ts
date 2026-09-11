import { Module } from '@nestjs/common';
import { RolesModule } from '@/modules/roles/roles.module';
import { UsersModule } from '@/modules/users/users.module';
import { PrismaModule } from '@/shared/database/prisma/prisma.module';

@Module({
  imports: [PrismaModule, UsersModule, RolesModule],
})
export class AppModule {}
