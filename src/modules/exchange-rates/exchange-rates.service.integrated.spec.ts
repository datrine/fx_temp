import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeRatesService } from './exchange-rates.service';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';

describe('ExchangeRatesService', () => {
  let service: ExchangeRatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports:[HttpModule,CacheModule.register()],
      providers: [ExchangeRatesService],
    }).compile();

    service = module.get<ExchangeRatesService>(ExchangeRatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
