import { Inject, Injectable } from '@nestjs/common';
import {  CreateTransactionInput, } from './types';
import { DataSource, FindManyOptions, Repository } from 'typeorm';
import { UserWallet } from '../../entities/user_wallet.entity';
import { WalletBalance } from '../../entities/wallet_balance';
import { UserAccount } from '../../entities/user_account.entity';
import { DATA_SOURCE, TRANSACTION_REPOSITORY, USER_ACCOUNT_REPOSITORY, USER_WALLET_REPOSITORY, WALLET_BALANCE_REPOSITORY } from '../../entity_provider/constant';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Transaction } from '../../entities/transaction';

@Injectable()
export class TransactionsService {
    constructor(
        @Inject(DATA_SOURCE) private datasource: DataSource,
        @Inject(USER_ACCOUNT_REPOSITORY) private userAccountRepository: Repository<UserAccount>,
        @Inject(TRANSACTION_REPOSITORY) private transactionRepository: Repository<Transaction>,
        private eventEmitter: EventEmitter2,) { }
    async createTransaction(input:CreateTransactionInput) {
        let created_transaction = await this.transactionRepository.save({
            type: input.type,
            wallet_id: input.wallet_id,
            user_account_id: input.user_account_id,
            value: input.value,
            currency: input.currency,
            base_currency:input.base_currency,
            counter_currency:input.counter_currency
        })
        return created_transaction
    }

    
    async getTransactions(options?: FindManyOptions<Transaction>) {
        let transactions = await this.transactionRepository.find(options)
        return transactions
    }
}
