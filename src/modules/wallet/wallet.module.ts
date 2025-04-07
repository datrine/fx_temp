import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { EntityProviderModule } from '../../entity_provider/entity_provider.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports:[EntityProviderModule,TransactionsModule],
  controllers: [WalletController],
  providers: [WalletService]
})
export class WalletModule {}
