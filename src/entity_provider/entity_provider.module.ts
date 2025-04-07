import { Module } from '@nestjs/common';
import { USER_ACCOUNT_REPOSITORY, WALLET_BALANCE_REPOSITORY, DATA_SOURCE, USER_WALLET_REPOSITORY, TOKEN_REPOSITORY } from './constant';
import { DatabaseModule } from '../database/database.module';
import { UserAccountEntityProvider } from './user_account_entity.provider';
import { UserWalletEntityProvider } from './user_wallet_entity.provider';
import { WalletBalanceEntityProvider } from './wallet_balance_entity.provider';
import { TokenEntityProvider } from './token_entity.provider';

@Module({
    imports: [DatabaseModule],
    providers: [UserAccountEntityProvider, UserWalletEntityProvider,WalletBalanceEntityProvider,TokenEntityProvider
    ], exports: [
        USER_ACCOUNT_REPOSITORY, 
        USER_WALLET_REPOSITORY,
        WALLET_BALANCE_REPOSITORY,
        TOKEN_REPOSITORY, 
        DatabaseModule]
})
export class EntityProviderModule { }
