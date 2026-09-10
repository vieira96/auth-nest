import { Module } from '@nestjs/common';
import { HelloWorldModule } from './modules/hello-world/hello-world.module.js';

@Module({
  imports: [HelloWorldModule],
})
export class AppModule {}
