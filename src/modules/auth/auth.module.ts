import { Module } from '@nestjs/common';
import { AuthController } from '@/modules/auth/controllers/auth.controller';
import { RolesModule } from '@/modules/roles/roles.module';
import { AuthService } from '@/modules/auth/services/auth.service';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [UsersModule, RolesModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
