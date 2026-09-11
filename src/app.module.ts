import { Module } from '@nestjs/common';
import { UsersModule } from '@/modules/users/users.module';
import { PrismaModule } from '@/shared/database/prisma/prisma.module';

@Module({
  imports: [PrismaModule, UsersModule],
})
export class AppModule {}
