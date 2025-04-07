import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { UserAccount } from '../../entities/user_account.entity';
import { HigherCurrencyEnum, LowerCurrencyEnum, TransactionTypeEnum, } from '../../entities/enums';
import { DATA_SOURCE, USER_ACCOUNT_REPOSITORY, USER_WALLET_REPOSITORY, WALLET_BALANCE_REPOSITORY } from '../../entity_provider/constant';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { convertHigherToLowerDenomitation, convertLowerToHigherDenomitation, getLowerDemonination } from '../../utils/currency_conversion_utils';
import { CurrenciesTradedEventPayloadType, ResolvedCurrencyObj, WalletFundedEventPayloadType } from './type';
import { UserWallet } from '../../entities/user_wallet.entity';
import { WalletCurrenciesTradedEvent, WalletFundedEvent } from './event';
import { TransactionsService } from '../transactions/transactions.service';
import { WalletBalance } from '../../entities/wallet_balance';
import { ExchangeRatesService } from '../exchange-rates/exchange-rates.service';

@Injectable()
export class WalletService {
    constructor(
        @Inject(DATA_SOURCE) private datasource: DataSource,
        @Inject(USER_WALLET_REPOSITORY) private userWalletRepository: Repository<UserWallet>,
        private transactionService: TransactionsService,
        private exchangeRateService: ExchangeRatesService,
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

            // create default currency balances for NGN, USD, GBP, EUR
            for (const currency of [LowerCurrencyEnum.KOBO, LowerCurrencyEnum.US_CENT,
            LowerCurrencyEnum.EU_CENT, LowerCurrencyEnum.PENCE]) {
                let index = userWallet.balances?.findIndex(bl => bl.currency === currency)
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
                    await txMgr.save(bal)
                }
            }
            userWallet = await txMgr.save(userWallet)
            return userWallet
        })(txn!)
        return userWallet
    }

    async getUserWallet(user_account_id: number,) {
        let userWallet = await this.datasource.manager.transaction(async txn => {

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

            //if not existing, create one on the fly
            if (!userWallet) {
                let createResult = await this.createUserWallet(user_account_id, txn)
                return createResult
            }

            // if not existing, create balances for NGN, USD, EUR, GBP
            if (!userWallet.balances || userWallet.balances.length === 0) {
                let createResult = await this.createOrGetWalletBalances(userWallet.id, txn)
                return createResult
            }
            return userWallet
        })
        return this.formatWallet(userWallet)
    }

    async fundWallet(user_account_id: number, { amount, currency }: { amount: number; currency: HigherCurrencyEnum.NGN }) {
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

            // add fund to currency balance
            await this.addToWalletBalance(userWallet.id, {
                user_account_id,
                increment_value: resolved.value,
                currency: resolved.currency
            }, txMgr)

            // 'refresh' userWallet
            userWallet = await userWalletRepository.findOne({
                where: {
                    user: {
                        id: user_account_id
                    }
                }, relations: {
                    balances: true,
                    user: true
                }
            })
            return userWallet!
        })
        let event_dto: WalletFundedEventPayloadType = {
            wallet_id: result.id,
            user_account_id: result.user.id,
            value: amount, currency
        }
        this.eventEmitter.emit(WalletFundedEvent, event_dto)
        return this.formatWallet(result)
    }

    async addToWalletBalance(wallet_id: number, set: { user_account_id: number; currency: LowerCurrencyEnum; increment_value: number }, txn?: EntityManager) {
        if (!txn) {
            txn = this.datasource.manager.transaction.bind(this)!
        }
        return (async (txn) => {
            let walletBalance = await txn.getRepository(WalletBalance).findOne({
                where: {
                    wallet: {
                        id: wallet_id
                    }, currency: set.currency
                }, relations: {
                    wallet: true,
                }
            });
            if (!walletBalance) {
                let wallet = await txn.getRepository(UserWallet).findOne({
                    where: {
                        id: wallet_id
                    }, relations: {
                        balances: true,
                    }
                });
                if (!wallet) {
                    throw new Error(`no wallet with id ${wallet_id}`)
                }

                walletBalance = txn.getRepository(WalletBalance).create()
                walletBalance.user_account_id = set.user_account_id
                walletBalance.wallet = wallet
                walletBalance.currency = set.currency
                walletBalance.value = set.increment_value
                await txn.save(walletBalance)
            } else {
                walletBalance.value += set.increment_value
                walletBalance.updated_at = new Date()
                await txn.save(walletBalance)
            }
            return walletBalance
        })(txn!)
    }

    async subtractFromWalletBalance(wallet_id: number, set: { user_account_id: number; currency: LowerCurrencyEnum; decrement_value: number }, txn?: EntityManager) {
        if (!txn) {
            txn = this.datasource.manager.transaction.bind(this)!
        }
        return (async (txn) => {
            let walletBalance = await txn.getRepository(WalletBalance).findOne({
                where: {
                    wallet: {
                        id: wallet_id
                    }, currency: set.currency
                }, relations: {
                    wallet: true,
                }
            });
            if (!walletBalance) {
                throw new Error(`no wallet with id ${wallet_id}`)
            } else {
                if ((walletBalance?.value - set.decrement_value) < 0) {
                    throw new BadRequestException("insufficient balance")
                }
                walletBalance.value -= set.decrement_value
                walletBalance.updated_at = new Date()
                await txn.save(walletBalance)
            }
            return walletBalance
        })(txn!)
    }

    async trade(user_account_id: number, trade_data: { amount: number, base: HigherCurrencyEnum, target: HigherCurrencyEnum }) {
        let result = await this.datasource.manager.transaction(async txn => {
            let userWallet = await txn.getRepository(UserWallet).findOne({
                where: {
                    user: {
                        id: user_account_id
                    },
                }, relations: {
                    balances: true,
                    user: true
                }
            });
            if (!userWallet) {
                // create a wallet for user
                throw new BadRequestException("insufficient balance")
            }
            //let base_balance = userWallet.balances.find(bal => bal.currency === getLowerDemonination(trade_data.base))

            let exc_obj = await this.convertCurrencies(trade_data.amount, trade_data.target, trade_data.base);
            console.log({ exc_obj })
            let resolved_to_base_low = convertHigherToLowerDenomitation({ value: exc_obj.value, currency: exc_obj.currency })
            let resolved_to_target_low = convertHigherToLowerDenomitation({ value: trade_data.amount, currency: trade_data.target })
            //let target_balance = userWallet.balances.find(bal => bal.currency === getLowerDemonination(trade_data.target))
            let base_balance: WalletBalance
            let target_balance: WalletBalance
            target_balance = await this.addToWalletBalance(userWallet.id, {
                user_account_id,
                increment_value: resolved_to_target_low.value,
                currency: resolved_to_target_low.currency
            }, txn)

            base_balance = await this.subtractFromWalletBalance(userWallet.id, {
                user_account_id,
                decrement_value: resolved_to_base_low.value,
                currency: resolved_to_base_low.currency
            }, txn)
            await txn.save(target_balance)
            await txn.save(base_balance)
            //await txn.save(userWallet.balances)
            /*
            if (!target_balance) {
                let bal = txn.getRepository(WalletBalance).create()
                bal.user_account_id = user_account_id
                bal.wallet = userWallet
                bal.currency = resolved_to_target_low.currency
                bal.value = resolved_to_base_low.value
                userWallet.balances.push(bal)
                await txn.save(bal)
                await txn.save(userWallet.balances)
            }else{
                target_balance.value+=resolved_to_target_low.value
                await txn.save(target_balance)
                await txn.save(userWallet.balances)
            }
            base_balance.value -= resolved_to_base_low.value
            base_balance.updated_at = new Date()
                */
            userWallet = await txn.getRepository(UserWallet).findOne({
                where: {
                    user: {
                        id: user_account_id
                    },
                }, relations: {
                    balances: true,
                    user: true
                }
            });
            return userWallet!
        })
        let event_dto: CurrenciesTradedEventPayloadType = {
            wallet_id: result.id,
            user_account_id: result.user.id,
            value: trade_data.amount,
            base_currency: trade_data.base,
            counter_currency: trade_data.target
        }
        this.eventEmitter.emit(WalletCurrenciesTradedEvent, event_dto)
        return this.formatWallet(result)
    }

    async convertCurrencies(amount: number, from: HigherCurrencyEnum, to: HigherCurrencyEnum) {
        let rate = await this.exchangeRateService.convertCurrencies(from, to)

        return { rate, value: Number((amount * rate).toFixed(2)), currency: to }
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
            type: TransactionTypeEnum.WALLET_FUNDING,
            user_account_id: payload.user_account_id,
            wallet_id: payload.wallet_id,
            currency: payload.currency,
            value: payload.value
        })
    }

    @OnEvent(WalletCurrenciesTradedEvent, { async: true })
    async handleCurrenciesTraded(payload: CurrenciesTradedEventPayloadType) {
        await this.transactionService.createTransaction({
            type: TransactionTypeEnum.TRADING,
            user_account_id: payload.user_account_id,
            wallet_id: payload.wallet_id,
            currency: payload.counter_currency,
            value: payload.value
        })
    }
}
