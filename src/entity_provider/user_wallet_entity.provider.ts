import { Module, Provider } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {DATA_SOURCE, USER_WALLET_REPOSITORY } from './constant';
import { UserWallet } from '../entities/user_wallet.entity';

export const UserWalletEntityProvider: Provider = {
    provide: USER_WALLET_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(UserWallet),
    inject: [DATA_SOURCE],
}
