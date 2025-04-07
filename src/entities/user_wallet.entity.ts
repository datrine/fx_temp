
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { WalletBalance } from './wallet_balance';
import { UserAccount } from './user_account.entity';

@Entity()
export class UserWallet {
  @PrimaryGeneratedColumn()
  id: number;
  
  //@Column({nullable:false,unique:true})
 // user_account_id: number;

  @Column("timestamp",{default:new Date()})
  created_at: Date;

  @OneToOne(()=>UserAccount)
  @JoinColumn()
  user:UserAccount

  @OneToMany(()=>WalletBalance,(balance)=>balance.wallet)
  balances:WalletBalance[]
}
