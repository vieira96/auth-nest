import { Module } from '@nestjs/common';
import { RolesController } from '@/modules/roles/controllers/roles.controller';
import { RolesService } from '@/modules/roles/services/roles.service';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
