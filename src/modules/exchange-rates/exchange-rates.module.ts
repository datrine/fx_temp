import { Module } from '@nestjs/common';
import { ExchangeRatesService } from './exchange-rates.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports:[HttpModule],
  providers: [ExchangeRatesService],exports:[ExchangeRatesService]
})
export class ExchangeRatesModule {}
