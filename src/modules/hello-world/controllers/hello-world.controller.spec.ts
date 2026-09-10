import { Test, TestingModule } from '@nestjs/testing';
import { HelloWorldController } from './hello-world.controller.js';
import { HelloWorldService } from '../services/hello-world.service.js';

describe('HelloWorldController', () => {
  let helloWorldController: HelloWorldController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HelloWorldController],
      providers: [HelloWorldService],
    }).compile();

    helloWorldController = module.get<HelloWorldController>(HelloWorldController);
  });

  it('returns the welcome message', () => {
    expect(helloWorldController.getHello()).toBe('Hello World!');
  });
});
