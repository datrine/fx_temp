import { Module, Provider } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {WALLET_BALANCE_REPOSITORY, DATA_SOURCE, } from './constant';
import { WalletBalance } from '../entities/wallet_balance';

export const WalletBalanceEntityProvider: Provider = {
    provide: WALLET_BALANCE_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(WalletBalance),
    inject: [DATA_SOURCE],
}
