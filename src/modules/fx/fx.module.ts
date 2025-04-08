import { Module } from '@nestjs/common';
import { FxController } from './fx.controller';
import { FxService } from './fx.service';
import { EntityProviderModule } from '../../entity_provider/entity_provider.module';
import { ExchangeRatesModule } from '../exchange-rates/exchange-rates.module';

@Module({
  imports:[EntityProviderModule,ExchangeRatesModule],
  controllers: [FxController],
  providers: [FxService]
})
export class FxModule {}
