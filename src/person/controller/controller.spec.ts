import { Test, TestingModule } from '@nestjs/testing';
import { PersonController } from './controller';
import { BiometricService } from '../services/biometricService';

describe('PersonController', () => {
  let controller: PersonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonController],
      providers: [BiometricService]
    }).compile();

    controller = module.get<PersonController>(PersonController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
