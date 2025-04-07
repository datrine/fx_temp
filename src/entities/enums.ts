
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Index } from 'typeorm';
import { UserWallet } from './user_wallet.entity';

export enum HigherCurrencyEnum {
  NGN = "NGN",
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP"
}

export enum LowerCurrencyEnum {
  KOBO = "KOBO",
  US_CENT = "US_CENT",
  PENCE = "PENCE",
  EU_CENT = "EU_CENT"
}

export enum CurrencyDenomination {
 HIGHER= "HIGHER",
 LOWER= "LOWER"
}


export enum TransactionTypeEnum {
    WALLET_FUNDING = "WALLET_FUNDING",
    CURRENCY_CONVERSION = "CURRENCY_CONVERSION",
    TRADING="TRADING"
  }