import { Inject, Injectable } from '@nestjs/common';
import {  CreateTransactionInput, UpdateTransactionInput, } from './types';
import { DataSource, FindManyOptions, Repository } from 'typeorm';
import { DATA_SOURCE, TRANSACTION_REPOSITORY, } from '../../entity_provider/constant';
import { Transaction } from '../../entities/transaction';

@Injectable()
export class TransactionsService {
    constructor(
        @Inject(TRANSACTION_REPOSITORY) private transactionRepository: Repository<Transaction>,) { }
    async createTransaction(input:CreateTransactionInput) {
        let created_transaction = await this.transactionRepository.save({
            type: input.type,
            wallet_id: input.wallet_id,
            user_account_id: input.user_account_id,
            status:input.status,
            value: input.value,
            currency: input.currency,
            base_currency:input.base_currency,
            counter_currency:input.counter_currency,
            rate:input.rate,
            initiating_trader_account_id: input.initiating_trader_account_id,
            second_trader_account_id: input.second_trader_account_id
        })
        return created_transaction
    }

  
    async updateTransaction(txn_id:number,input:UpdateTransactionInput) {
        let created_transaction = await this.transactionRepository.update(txn_id,{
            type: input.type,
            wallet_id: input.wallet_id,
            user_account_id: input.user_account_id,
            status:input.status,
            value: input.value,
            currency: input.currency,
            base_currency:input.base_currency,
            counter_currency:input.counter_currency,
            rate:input.rate,
            initiating_trader_account_id: input.initiating_trader_account_id,
            second_trader_account_id: input.second_trader_account_id
        })
        return created_transaction
    }

    async getTransaction(txn_id:number) {
        let txn = await this.transactionRepository.findOne({
            where:{
                id:txn_id
            }
        })
        return txn
    }  

    async getTransactions(options?: FindManyOptions<Transaction>) {
        let transactions = await this.transactionRepository.find(options)
        return transactions
    }
}
