import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EntityProviderModule } from '../../entity_provider/entity_provider.module';
import { EmailModule } from '../dependency/email/email.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { WalletModule } from '../wallet/wallet.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports:[ThrottlerModule.forRoot({
    throttlers: [
      {
        ttl: 60000,
        limit: 10,
      },
    ],
  }),EntityProviderModule,EmailModule,TransactionsModule,WalletModule],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
