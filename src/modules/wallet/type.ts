import { LowerCurrencyEnum } from "../../entities/enums";


export type ResolvedCurrencyObj={
    value:number;
    currency:LowerCurrencyEnum
}


export type WalletFundedEventPayloadType={
    wallet_id:number;
    user_account_id:number;
    value:number;
    currency:LowerCurrencyEnum
}