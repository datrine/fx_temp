import { HigherCurrencyEnum, LowerCurrencyEnum } from "../../entities/enums";


export type ResolvedCurrencyObj = {
    value: number;
    currency: LowerCurrencyEnum
}


export type WalletFundedEventPayloadType = {
    txn_id: number
    wallet_id: number;
    user_account_id: number;
    value: number;
    currency: HigherCurrencyEnum
}


export type WalletFundingFailedEventPayloadType = {
    txn_id: number
}
export type CurrenciesTradingFailedEventPayloadType = {
    txn_id: number
}

export type CurrenciesTradedEventPayloadType = {
    txn_id: number
}


export type CurrencyConvertedEventPayloadType = {
    txn_id: number
    user_account_id: number
    value: number;
    counter_currency: HigherCurrencyEnum
    base_currency: HigherCurrencyEnum
}


export type CurrencyConversionFailedEventPayloadType = {
    txn_id: number
}