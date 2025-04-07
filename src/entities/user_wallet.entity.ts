
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { WalletBalance } from './wallet_balance';

@Entity()
export class UserWallet {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({nullable:false})
  user_account_id: number;

  @Column("timestamp")
  created_at: Date;

  @OneToMany(()=>WalletBalance,(balance)=>balance.wallet)
  balances:WalletBalance[]
}
