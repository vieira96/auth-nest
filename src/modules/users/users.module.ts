import { Module } from '@nestjs/common';
import { UsersController } from '@/modules/users/controllers/users.controller';
import { UsersService } from '@/modules/users/services/users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
