import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { EntityProviderModule } from '../../entity_provider/entity_provider.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { ExchangeRatesModule } from '../exchange-rates/exchange-rates.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports:[ThrottlerModule.forRoot({
    throttlers: [
      {
        ttl: 60000,
        limit: 10,
      },
    ],
  }),
    EntityProviderModule,TransactionsModule,ExchangeRatesModule],
  controllers: [WalletController],
  providers: [WalletService],exports:[WalletService]
})
export class WalletModule {}
