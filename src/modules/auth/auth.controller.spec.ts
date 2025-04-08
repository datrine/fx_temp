import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EntityProviderModule } from '../../entity_provider/entity_provider.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EmailModule } from '../dependency/email/email.module';
import { JwtModule } from '@nestjs/jwt';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { GetDatabaseSourceProvider, getDbContainer, teardownMySqlContainer } from '../../utils/test_utils/db_conn';
import { UserAccountEntityProvider } from '../../entity_provider/user_account_entity.provider';
import { TokenEntityProvider } from '../../entity_provider/token_entity.provider';
import { WalletService } from '../wallet/wallet.service';
import { UserWalletEntityProvider } from '../../entity_provider/user_wallet_entity.provider';
import { TransactionsService } from '../transactions/transactions.service';
import { ExchangeRatesService } from '../exchange-rates/exchange-rates.service';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { TransactionEntityProvider } from '../../entity_provider/transaction_entity.provider';

describe('AuthController', () => {
  let controller: AuthController;
  let container: StartedPostgreSqlContainer
  beforeAll(async () => {
    container = await getDbContainer()
    let dbSourceProvider = GetDatabaseSourceProvider(container)
    const module: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot(), EmailModule, JwtModule.register({
        secret: "secret_key"
      }), HttpModule, CacheModule.register()],
      controllers: [AuthController], providers: [AuthService, dbSourceProvider,
        UserAccountEntityProvider, UserWalletEntityProvider,
        TokenEntityProvider, WalletService, TransactionsService, ExchangeRatesService,TransactionEntityProvider]
    }).compile();

    controller = module.get<AuthController>(AuthController);
  }, 60000);

  afterAll(async () => {
    await teardownMySqlContainer(container)
  }, 10000)

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
