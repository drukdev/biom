import { Test, TestingModule } from '@nestjs/testing';
import { LicenseController } from './license.controller';
import { LicenseService } from '../services/license.service';
import { AuthGuard } from '@nestjs/passport';

describe('LicenseController', () => {
  let controller: LicenseController;
  let service: LicenseService;

  const mockLicenseService = {
    checkBalance: jest.fn(),
    logUsage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LicenseController],
      providers: [
        {
          provide: LicenseService,
          useValue: mockLicenseService,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<LicenseController>(LicenseController);
    service = module.get<LicenseService>(LicenseService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkBalance', () => {
    it('should call the license service to check the balance', async () => {
      await controller.checkBalance('org123');
      expect(service.checkBalance).toHaveBeenCalledWith('org123');
    });
  });

  describe('logUsage', () => {
    it('should call the license service to log usage', async () => {
      const body = {
        orgdid: 'org123',
        liveliness_count: 1,
        match_count: 2,
        search_count: 3,
      };
      await controller.logUsage(body);
      expect(service.logUsage).toHaveBeenCalledWith(
        'org123',
        1,
        2,
        3
      );
    });
  });
});
