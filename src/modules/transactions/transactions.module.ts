import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { EntityProviderModule } from '../../entity_provider/entity_provider.module';

@Module({
  imports:[EntityProviderModule],
  providers: [TransactionsService],
  controllers: [TransactionsController],exports:[TransactionsService]
})
export class TransactionsModule {}
