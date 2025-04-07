import { HigherCurrencyEnum, LowerCurrencyEnum } from "../../entities/enums";


export type ResolvedCurrencyObj={
    value:number;
    currency:LowerCurrencyEnum
}


export type WalletFundedEventPayloadType={
    wallet_id:number;
    user_account_id:number;
    value:number;
    currency:HigherCurrencyEnum
}


export type CurrenciesTradedEventPayloadType={
    wallet_id:number;
    user_account_id:number;
    value:number;
    counter_currency:HigherCurrencyEnum
    base_currency:HigherCurrencyEnum
}