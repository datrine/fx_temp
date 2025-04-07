import { Module } from '@nestjs/common';
import { UserAccount } from '../entities/user_account.entity';
import { UserWallet } from '../entities/user_wallet.entity';
import { DataSource } from 'typeorm';
import { DATA_SOURCE } from '../entity_provider/constant';
import { WalletBalance } from '../entities/wallet_balance';
import { Token } from '../entities/token.entity';

@Module({
    providers: [{
        provide: 'DATA_SOURCE',
        useFactory: async () => {
            const port = parseInt(String(process.env.DB_PORT))
            const dataSource = new DataSource({
                type: process.env.DB_DIALECT as any,
                host: process.env.DB_HOST,
                port,
                username: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                entities: [UserAccount, UserWallet,WalletBalance,Token
                ],
                synchronize: true,
            });

            return dataSource.initialize();
        },
    },],exports:[DATA_SOURCE]
})
export class DatabaseModule { }
