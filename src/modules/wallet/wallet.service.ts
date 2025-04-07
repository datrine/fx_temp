import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { UserAccount } from '../../entities/user_account.entity';
import { HigherCurrencyEnum, LowerCurrencyEnum, TransactionTypeEnum, } from '../../entities/enums';
import { DATA_SOURCE, USER_ACCOUNT_REPOSITORY, USER_WALLET_REPOSITORY, WALLET_BALANCE_REPOSITORY } from '../../entity_provider/constant';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { convertHigherToLowerDenomitation, convertLowerToHigherDenomitation } from '../../utils/currency_conversion_utils';
import { ResolvedCurrencyObj, WalletFundedEventPayloadType } from './type';
import { UserWallet } from '../../entities/user_wallet.entity';
import { WalletFundedEvent } from './event';
import { TransactionsService } from '../transactions/transactions.service';
import { WalletBalance } from '../../entities/wallet_balance';

@Injectable()
export class WalletService {
    constructor(
        @Inject(DATA_SOURCE) private datasource: DataSource,
        @Inject(USER_ACCOUNT_REPOSITORY) private userAccountRepository: Repository<UserAccount>,
        @Inject(WALLET_BALANCE_REPOSITORY) private walletBalanceRepository: Repository<WalletBalance>,
        @Inject(USER_WALLET_REPOSITORY) private userWalletRepository: Repository<UserWallet>,
        private transactionService: TransactionsService,
        private eventEmitter: EventEmitter2,) { }

    async createUserWallet(user_account_id: number, txn?: EntityManager) {
        if (!txn) {
            txn = this.datasource.manager.transaction.bind(this)
        }
        let userWallet = await (async txMgr => {
            let userWallet =
                await txMgr.getRepository(UserWallet).findOne({
                    where: {
                        user: {
                            id: user_account_id
                        }
                    },
                    relations: {
                        user: true,
                        balances: true
                    }
                })

            // if user's wallet does not exist, create it
            if (!userWallet) {
                let user = await txMgr.getRepository(UserAccount).findOne({
                    where: {
                        id: user_account_id
                    }
                })
                if (!user) {
                    throw new Error("user not found")
                }
                userWallet = txMgr.getRepository(UserWallet).create()
                userWallet.user = user
                userWallet.created_at = new Date()
                await txMgr.save(userWallet)
            }

            // create default currency balances
            userWallet = await this.createOrGetWalletBalances(userWallet.id, txMgr)
            userWallet = await txMgr.save(userWallet)
            return userWallet
        })(txn!)
        return userWallet
    }

    async createOrGetWalletBalances(wallet_id: number, txn?: EntityManager) {
        if (!txn) {
            txn = this.datasource.manager.transaction.bind(this)!
        }
        let userWallet = await (async txMgr => {
            let userWallet =
                await txMgr.getRepository(UserWallet).findOne({
                    where: {
                        id: wallet_id
                    },
                    relations: {
                        user: true,
                        balances: true
                    }
                })

            // if user's wallet does not exist, create it
            if (!userWallet) {
                throw new Error("wallet not found")
            }

            // create default currency balances
            for (const currency of [LowerCurrencyEnum.KOBO, LowerCurrencyEnum.US_CENT,
            LowerCurrencyEnum.EU_CENT, LowerCurrencyEnum.PENCE]) {
                let index = userWallet.balances?.findIndex(bl => bl.currency === currency)
                console.log({ yy: userWallet.balances })
                if (Number.isNaN(Number(index)) || index === -1) {
                    let bal = txMgr.getRepository(WalletBalance).create()
                    bal.wallet = userWallet
                    bal.user_account_id = userWallet.user.id
                    bal.currency = currency
                    bal.value = 0
                    if (!userWallet.balances) {
                        userWallet.balances = []
                    }
                    userWallet.balances.push(bal)
                    console.log({ userWallet })
                    await txMgr.save(bal)
                }
            }
            userWallet = await txMgr.save(userWallet)
            return userWallet
        })(txn!)
        return userWallet
    }

    async getUserWallet(user_account_id: number,) {
        let userWallet = await this.userWalletRepository.findOne({
            where: {
                user: {
                    id: user_account_id
                }
            },
            relations: {
                user: true,
                balances: true,
            }
        })
        console.log(userWallet)
        if (!userWallet) {
            let createResult = await this.createUserWallet(user_account_id)
            return this.formatWallet(createResult) 
        }
        if (!userWallet.balances || userWallet.balances.length === 0) {
            let createResult = await this.createOrGetWalletBalances(userWallet.id)
            return this.formatWallet(createResult) 
        }
        return this.formatWallet(userWallet)
    }

    async fundWallet(user_account_id: number, { amount, currency }: { amount: number; currency: HigherCurrencyEnum }) {
        let resolved: ResolvedCurrencyObj = convertHigherToLowerDenomitation({ value: amount, currency })
        let result = await this.datasource.transaction(async txMgr => {
            let userWalletRepository = txMgr.getRepository(UserWallet)
            let userWallet = await userWalletRepository.findOne({
                where: {
                    user: {
                        id: user_account_id
                    }
                }, relations: {
                    balances: true,
                    user: true
                }
            })
            // if user's wallet does not exist, create it
            if (!userWallet) {
                userWallet = await this.createUserWallet(user_account_id, txMgr)
            }
            console.log(userWallet.balances, resolved)
            let balanceIndex = userWallet.balances?.findIndex(bal => bal.currency === resolved.currency)
            if (Number.isNaN(Number(balanceIndex)) || balanceIndex === -1) {
                let balance = txMgr.getRepository(WalletBalance).create()
                balance.user_account_id = user_account_id
                balance.currency = resolved.currency
                balance.value = resolved.value
                balance.created_at = new Date()
                if (!userWallet.balances) {
                    userWallet.balances = []
                }
                await txMgr.save(balance)
                userWallet.balances = [...userWallet.balances, balance]
                await txMgr.save(userWallet.balances)
            } else {
                userWallet.balances[balanceIndex].value += resolved.value
                userWallet.balances[balanceIndex].updated_at = new Date()
                await txMgr.save(userWallet.balances)
            }
            await txMgr.save(userWallet)
            return userWallet
        })
        let event_dto:WalletFundedEventPayloadType={
            wallet_id:result.id,
            user_account_id:result.user.id,
            ...resolved
        }
        this.eventEmitter.emit(WalletFundedEvent,event_dto)
        return this.formatWallet(result)
    }

    // format user wallet balances
    formatWallet(wallet: UserWallet) {
        let resolved_balances = wallet.balances.map(convertLowerToHigherDenomitation)
        let dto = {
            user_id: wallet.user.id,
            wallet_id: wallet.id,
            balances: resolved_balances
        }
        return dto
    }

    @OnEvent(WalletFundedEvent, { async: true })
    async handleWalletFunded(payload: WalletFundedEventPayloadType) {
       await this.transactionService.createTransaction({
            ...payload,type:TransactionTypeEnum.WALLET_FUNDING
        })
    }

}
