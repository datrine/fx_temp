import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { EntityProviderModule } from '../../entity_provider/entity_provider.module';

@Module({
  imports:[EntityProviderModule],
  controllers: [WalletController],
  providers: [WalletService]
})
export class WalletModule {}
