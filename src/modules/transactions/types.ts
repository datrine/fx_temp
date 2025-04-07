import { LowerCurrencyEnum, TransactionTypeEnum } from "../../entities/enums"

export type CreateTransactionInput = {
    type: TransactionTypeEnum;
    user_account_id: number;
    wallet_id?: number;
    value: number;
    currency: LowerCurrencyEnum;
}