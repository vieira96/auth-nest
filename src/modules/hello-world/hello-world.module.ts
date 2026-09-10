import { Module } from '@nestjs/common';
import { HelloWorldController } from './controllers/hello-world.controller.js';
import { HelloWorldService } from './services/hello-world.service.js';

@Module({
  controllers: [HelloWorldController],
  providers: [HelloWorldService],
})
export class HelloWorldModule {}
