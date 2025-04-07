import { Module, Provider } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DATA_SOURCE, TRANSACTION_REPOSITORY, } from './constant';
import { Transaction } from '../entities/transaction';

export const TransactionEntityProvider: Provider = {
    provide: TRANSACTION_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Transaction),
    inject: [DATA_SOURCE],
}
