import { HigherCurrencyEnum, LowerCurrencyEnum, TransactionStatusEnum, TransactionTypeEnum } from "../../entities/enums"

export type CreateTransactionInput = {
    type: TransactionTypeEnum;
    user_account_id?: number; 
    initiating_trader_account_id?: number;
    second_trader_account_id?: number;
    wallet_id?: number;
    value: number;
    currency?: HigherCurrencyEnum;
    rate?: number;
    status?: TransactionStatusEnum;
    base_currency?: HigherCurrencyEnum;
    counter_currency?: HigherCurrencyEnum;
}


export type UpdateTransactionInput = {
    type?: TransactionTypeEnum;
    user_account_id?: number;
    initiating_trader_account_id?: number;
    second_trader_account_id?: number;
    rate?: number;
    wallet_id?: number;
    value?: number;
    status?: TransactionStatusEnum;
    currency?: HigherCurrencyEnum;
    base_currency?: HigherCurrencyEnum;
    counter_currency?: HigherCurrencyEnum;
}
