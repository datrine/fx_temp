
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Index } from 'typeorm';
import { UserWallet } from './user_wallet.entity';
import { CurrencyDenomination, LowerCurrencyEnum, TransactionTypeEnum } from './enums';
import { UserAccount } from './user_account.entity';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable:true})
  wallet_id: number;

  @Column({enum:TransactionTypeEnum})
  type:TransactionTypeEnum

  @Column({ enum: LowerCurrencyEnum })
  currency: LowerCurrencyEnum;

  @Column({ enum: CurrencyDenomination, default: CurrencyDenomination.LOWER })
  denomination: CurrencyDenomination;

  @Column({ default: 0 })
  value: number;

  @Column("timestamp", { default: new Date() })
  created_at: Date;

  @Column("timestamp", { nullable: true })
  updated_at: Date;

  @ManyToOne(() => UserAccount, (user) => user.transactions)
  user: UserAccount
}
