
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { UserWallet } from './user_wallet.entity';

export enum CurrencyEnum {
  "NGN",
  "USD",
  "EUR"
}

export enum LowerCurrencyEnum {
  "KOBO",
  "US_CENT",
  "PENCE",
  "EU_CENT"
}

export enum CurrencyDenomination {
  "HIGHER",
  "LOWER"
}
@Entity()
export class WalletBalance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({enum:LowerCurrencyEnum})
  currency: LowerCurrencyEnum;

  @Column({ enum: CurrencyDenomination,default:CurrencyDenomination.LOWER })
  denomination: CurrencyDenomination;

  @Column({default:0})
  balance: number;

  @Column("timestamp")
  updated_at: Date;

  @ManyToOne(() => UserWallet, (wallet) => wallet.balances)
  wallet: UserWallet
}
