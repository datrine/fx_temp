
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Index } from 'typeorm';
import { UserWallet } from './user_wallet.entity';
import { CurrencyDenomination, CurrencyEnum, LowerCurrencyEnum, TransactionStatusEnum, TransactionTypeEnum } from './enums';
import { UserAccount } from './user_account.entity';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  wallet_id: number;

  @Column({nullable:true})
  user_account_id?:number

  
  @Column({nullable:true})
  initiating_trader_account_id?:number

  
  @Column({nullable:true})
  second_trader_account_id?:number

  @Column({ enum: TransactionTypeEnum })
  type: TransactionTypeEnum

  @Column({enum:TransactionStatusEnum,default:TransactionStatusEnum.COMPLETED,nullable:true})
  status: TransactionStatusEnum


  @Column({ default: 0 })
  value: number;

  @Column({nullable:true})
  currency: string;
  
  @Column({nullable:true})
  rate?:number

  @Column({nullable:true})
  base_currency?:string
  
  @Column({nullable:true})
  counter_currency?:string

  @Column({ enum: CurrencyDenomination, nullable: true })
  denomination: CurrencyDenomination;

  @Column("timestamp", { default: new Date() })
  created_at: Date;

  @Column("timestamp", { nullable: true })
  updated_at: Date;

  @ManyToOne(() => UserAccount, (user) => user.transactions)
  user: UserAccount
}
