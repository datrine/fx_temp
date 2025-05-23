
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Index } from 'typeorm';
import { UserWallet } from './user_wallet.entity';
import { CurrencyDenomination, LowerCurrencyEnum } from './enums';

@Entity()

@Index(["currency", "user_account_id",], { unique: true, })
export class WalletBalance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable:false})
  user_account_id: number;

  @Column({ enum: LowerCurrencyEnum})
  currency: LowerCurrencyEnum;

  @Column({ enum: CurrencyDenomination, default: CurrencyDenomination.LOWER })
  denomination: CurrencyDenomination;

  @Column({ default: 0 })
  value: number;

  @Column("timestamp", { default: new Date() })
  created_at: Date;

  @Column("timestamp", { nullable: true })
  updated_at: Date;

  @ManyToOne(() => UserWallet, (wallet) => wallet.balances)
  wallet: UserWallet
}
