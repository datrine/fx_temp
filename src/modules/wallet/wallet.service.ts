import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { UserAccount } from '../../entities/user_account.entity';
import { HigherCurrencyEnum, LowerCurrencyEnum, TransactionStatusEnum, TransactionTypeEnum, } from '../../entities/enums';
import { DATA_SOURCE, USER_ACCOUNT_REPOSITORY, USER_WALLET_REPOSITORY, WALLET_BALANCE_REPOSITORY } from '../../entity_provider/constant';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { convertHigherToLowerDenomitation, convertLowerToHigherDenomitation, getLowerDemonination } from '../../utils/currency_conversion_utils';
import { CurrenciesTradedEventPayloadType, CurrenciesTradingFailedEventPayloadType, CurrencyConversionFailedEventPayloadType, CurrencyConvertedEventPayloadType, ResolvedCurrencyObj, WalletFundedEventPayloadType, WalletFundingFailedEventPayloadType } from './type';
import { UserWallet } from '../../entities/user_wallet.entity';
import { WalletCurrenciesTradedEvent, WalletCurrenciesTradingFailedEvent, WalletCurrencyConversionFailedEvent, WalletCurrencyConvertedEvent, WalletFundedEvent, WalletFundingFailedEvent } from './event';
import { TransactionsService } from '../transactions/transactions.service';
import { WalletBalance } from '../../entities/wallet_balance';
import { ExchangeRatesService } from '../exchange-rates/exchange-rates.service';
import * as assert from 'assert';

@Injectable()
export class WalletService {
    constructor(
        @Inject(DATA_SOURCE) private datasource: DataSource,
        @Inject(USER_WALLET_REPOSITORY) private userWalletRepository: Repository<UserWallet>,
        private transactionService: TransactionsService,
        private exchangeRateService: ExchangeRatesService,
        private eventEmitter: EventEmitter2,) { }
    async fetchUserWallet(user_account_id: number) {
        let userWallet = await this.getOrCreateUserWallet(user_account_id)
        if (!userWallet) {
            throw new InternalServerErrorException("user wallet could not be created")
        }
        return this.formatWallet(userWallet)
    }


    async trade(user_account_id: number,
        trade_data: {
            second_trader_id: number,
            amount: number,
            sending: HigherCurrencyEnum,
            receiving: HigherCurrencyEnum;
        }) {

        // start trading transaction

        // create a transaction 
        let txn = await this.transactionService.createTransaction({
            user_account_id,
            initiating_trader_account_id: user_account_id,
            second_trader_account_id: trade_data.second_trader_id,
            type: TransactionTypeEnum.TRADING,
            value: trade_data.amount,
            base_currency: trade_data.sending,
            counter_currency: trade_data.receiving,
            status: TransactionStatusEnum.PENDING
        })
        let result: UserWallet
        let exc_rate
        try {
            this.validateNumber(trade_data.amount)
            exc_rate = await this.exchangeRateService.convertCurrencies(trade_data.sending, trade_data.receiving);
            await this.transactionService.updateTransaction(txn.id, { rate: exc_rate })
        } catch (error) {
            let event_dto: CurrenciesTradingFailedEventPayloadType = {
                txn_id: txn.id,
            }
            this.eventEmitter.emit(WalletCurrenciesTradingFailedEvent, event_dto)
            throw error
        }
        return {}
    }

    async convertCurrencies(user_account_id: number, amount: number, base: HigherCurrencyEnum, target: HigherCurrencyEnum) {
        let txn = await this.transactionService.createTransaction({
            user_account_id,
            type: TransactionTypeEnum.CURRENCY_CONVERSION,
            value: amount,
            base_currency: base,
            counter_currency: target,
            status: TransactionStatusEnum.PENDING
        })
        let rate: number
        let result
        try {
            rate = await this.exchangeRateService.convertCurrencies(base, target)
            result = await this.datasource.transaction(async txMgr => {
                let wallet = await this.fetchUserWallet(user_account_id)
                let decrement_base_value_high = Number((rate * amount).toFixed(2))
                console.log({ decrement_base_value_high, base, target, amount })
                let resolvedTo = convertHigherToLowerDenomitation({
                    currency: base, value: amount
                })
                let resolvedFrom = convertHigherToLowerDenomitation({
                    currency: target, value: decrement_base_value_high
                })
                console.log({ decrement_base_value_high, base, target, amount, resolvedBase: resolvedTo, resolvedTarget: resolvedFrom })
                await this.addToWalletBalance(wallet.wallet_id, {
                    user_account_id,
                    increment_value: resolvedTo.value,
                    currency: resolvedTo.currency,
                }, txMgr)
                console.log("jjkkh")
                await this.subtractFromWalletBalance(wallet.wallet_id, {
                    user_account_id,
                    decrement_value: resolvedFrom.value,
                    currency: resolvedFrom.currency,
                }, txMgr)
                console.log("uuuiuyuiyu")
                let newWalletInfo = await this.getUserWallet(user_account_id, txMgr)
                return newWalletInfo
            })
        } catch (error) {
            let event_dto: CurrencyConversionFailedEventPayloadType = {
                txn_id: txn.id
            }
            this.eventEmitter.emit(WalletCurrencyConversionFailedEvent, event_dto)
            throw error
        }


        // emit success
        let event_dto: CurrencyConvertedEventPayloadType = {
            txn_id: txn.id,
            user_account_id,
            value: amount,
            base_currency: base,
            counter_currency: target
        }
        this.eventEmitter.emit(WalletCurrencyConvertedEvent, event_dto)

        return this.formatWallet(result)
    }

    async fundWallet(user_account_id: number, { amount, currency }: { amount: number; currency: HigherCurrencyEnum }) {

        let txn = await this.transactionService.createTransaction({
            user_account_id,
            type: TransactionTypeEnum.WALLET_FUNDING,
            value: amount,
            currency,
            status: TransactionStatusEnum.PENDING
        })
        let result: UserWallet
        try {
            this.validateNumber(amount)
            let resolved: ResolvedCurrencyObj = convertHigherToLowerDenomitation({ value: amount, currency })
            this.validateNumber(resolved.value)
            result = await this.datasource.transaction(async txMgr => {
                let userWallet = await this.getOrCreateUserWallet(user_account_id, txMgr)
                if (!userWallet) {
                    throw new Error("user wallet could not be created")
                }
                // add fund to currency balance
                await this.addToWalletBalance(userWallet.id, {
                    user_account_id,
                    increment_value: resolved.value,
                    currency: resolved.currency
                }, txMgr)

                // 'refresh' userWallet
                let userWalletRepository = txMgr.getRepository(UserWallet)
                let refreshedUserWallet = await userWalletRepository.findOne({
                    where: {
                        user: {
                            id: user_account_id
                        }
                    }, relations: {
                        balances: true,
                        user: true
                    }
                })
                if (!refreshedUserWallet) {
                    throw new Error("user wallet could not be funded")
                }
                return refreshedUserWallet!
            })
        } catch (error) {
            let event_dto: WalletFundingFailedEventPayloadType = {
                txn_id: txn.id,
            }
            this.eventEmitter.emit(WalletFundingFailedEvent, event_dto)
            throw error
        }


        let event_dto: WalletFundedEventPayloadType = {
            txn_id: txn.id,
            wallet_id: result.id,
            user_account_id: result.user.id,
            value: amount, currency
        }
        this.eventEmitter.emit(WalletFundedEvent, event_dto)
        return this.formatWallet(result)
    }

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
    async getUserWallet(user_account_id: number, txn?: EntityManager) {
        if (!txn) {
            txn = this.datasource.manager
        }
        let userWallet = await (async txn => {
            let userWallet = await txn?.getRepository(UserWallet).findOne({
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
            return userWallet
        })(txn)
        return userWallet
    }

    async getOrCreateUserWallet(user_account_id: number, txn?: EntityManager) {
        if (!txn) {
            txn = this.datasource.manager
        }
        let userWallet = await (async txn => {
            let userWallet = await txn?.getRepository(UserWallet).findOne({
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
        })(txn)
        return userWallet
    }

    async addToWalletBalance(wallet_id: number, set: { user_account_id: number; currency: LowerCurrencyEnum; increment_value: number }, txn?: EntityManager) {
        if (!txn) {
            txn = this.datasource.manager
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
                try {
                    this.validateNumber(walletBalance.value + set.increment_value)
                } catch (error) {
                    throw new Error("sum of current balance and deposit must not be greater max value possible")
                }

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


    validateNumber(amount: number,) {
        assert(!Number.isNaN(amount), new BadRequestException("amount must be a number"))
        assert(amount > 0, new BadRequestException("amount must be greater than 0"))
        assert(Number.MAX_SAFE_INTEGER >= (amount), new BadRequestException(`amount must not be more than ${Number.MAX_SAFE_INTEGER}  `))
        assert(Number.MAX_SAFE_INTEGER >= (amount), new BadRequestException(`amount must not be more than ${Number.MAX_SAFE_INTEGER}  `))
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

    //WalletFundingFailedEvent WalletFundingFailedEventPayloadType
    @OnEvent(WalletFundingFailedEvent, { async: true })
    async handleFailingFailed(payload: WalletFundingFailedEventPayloadType) {
        await this.transactionService.updateTransaction(payload.txn_id, {
            status: TransactionStatusEnum.FAILED
        })
    }

    @OnEvent(WalletCurrencyConvertedEvent, { async: true })
    async handleCurrencyConverted(payload: CurrencyConvertedEventPayloadType) {
        await this.transactionService.updateTransaction(payload.txn_id, {
            user_account_id: payload.user_account_id,
            status: TransactionStatusEnum.COMPLETED
        })
    }

    @OnEvent(WalletCurrencyConversionFailedEvent, { async: true })
    async handleCurrencyConversionFailed(payload: CurrencyConvertedEventPayloadType) {
        await this.transactionService.updateTransaction(payload.txn_id, {
            user_account_id: payload.user_account_id,
            status: TransactionStatusEnum.FAILED
        })
    }

    @OnEvent(WalletCurrenciesTradingFailedEvent, { async: true })
    async handleCurrenciesTradingFailed(payload: CurrenciesTradedEventPayloadType) {
        await this.transactionService.updateTransaction(payload.txn_id, {
            wallet_id: payload.first_trader_id,
            status: TransactionStatusEnum.FAILED,
        })
    }

    @OnEvent(WalletFundedEvent, { async: true })
    async handleWalletFunded(payload: WalletFundedEventPayloadType) {
        await this.transactionService.updateTransaction(payload.txn_id, {
            wallet_id: payload.wallet_id,
            status: TransactionStatusEnum.COMPLETED
        })
    }

    @OnEvent(WalletCurrenciesTradedEvent, { async: true })
    async handleCurrenciesTraded(payload: CurrenciesTradedEventPayloadType) {
        await this.transactionService.updateTransaction(payload.txn_id, {
            wallet_id: payload.first_trader_id,
            status: TransactionStatusEnum.COMPLETED,
        })
    }
}
