import { Test, TestingModule } from '@nestjs/testing';
import { LicenseService } from './license.service';
import { LicenseRepository } from '../repository/license.repository';
import { LicenseLimit } from '../interface/license.interface';

describe('LicenseService', () => {
  let service: LicenseService;
  let repository: LicenseRepository;

  const mockLicenseRepository = {
    getLicenseLimit: jest.fn(),
    createLicenseLog: jest.fn(),
    updateLicenseLimit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LicenseService,
        {
          provide: LicenseRepository,
          useValue: mockLicenseRepository,
        },
      ],
    }).compile();

    service = module.get<LicenseService>(LicenseService);
    repository = module.get<LicenseRepository>(LicenseRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkBalance', () => {
    it('should return true if license limit is not found', async () => {
      mockLicenseRepository.getLicenseLimit.mockResolvedValue(null);
      const result = await service.checkBalance('org123');
      expect(result).toBe(true);
    });

    it('should return true if usage is 0', async () => {
      const licenseLimit: LicenseLimit = {
        orgdid: 'org123',
        usage: 0,
        balance: 100,
        threshold: 80,
        reset_datetime: new Date(),
        orgadmin: 'admin@org.com',
        lastupdated: new Date(),
      };
      mockLicenseRepository.getLicenseLimit.mockResolvedValue(licenseLimit);
      const result = await service.checkBalance('org123');
      expect(result).toBe(true);
    });

    it('should return true if balance is greater than usage', async () => {
      const licenseLimit: LicenseLimit = {
        orgdid: 'org123',
        usage: 50,
        balance: 100,
        threshold: 80,
        reset_datetime: new Date(),
        orgadmin: 'admin@org.com',
        lastupdated: new Date(),
      };
      mockLicenseRepository.getLicenseLimit.mockResolvedValue(licenseLimit);
      const result = await service.checkBalance('org123');
      expect(result).toBe(true);
    });

    it('should return false if balance is not greater than usage', async () => {
      const licenseLimit: LicenseLimit = {
        orgdid: 'orgdid1',
        usage: 100,
        balance: 100,
        threshold: 80,
        reset_datetime: new Date(),
        orgadmin: 'admin@org.com',
        lastupdated: new Date(),
      };
      mockLicenseRepository.getLicenseLimit.mockResolvedValue(licenseLimit);
      const result = await service.checkBalance('orgdid1');
      expect(result).toBe(false);
    });
  });

  describe('logUsage', () => {
    it('should create a license log and update the license limit', async () => {
      const licenseLimit: LicenseLimit = {
        orgdid: 'orgdid1',
        usage: 50,
        balance: 100,
        threshold: 80,
        reset_datetime: new Date(),
        orgadmin: 'admin@org.com',
        lastupdated: new Date(),
      };
      mockLicenseRepository.getLicenseLimit.mockResolvedValue(licenseLimit);
      await service.logUsage('orgdid1', 1, 2, 3);
      expect(repository.createLicenseLog).toHaveBeenCalledWith({
        orgdid: 'orgdid1',
        liveliness_count: 1,
        match_count: 2,
        search_count: 3,
      });
      expect(repository.updateLicenseLimit).toHaveBeenCalledWith('orgdid1', {
        usage: 53,
        balance: 97,
      });
    });
  });
});
