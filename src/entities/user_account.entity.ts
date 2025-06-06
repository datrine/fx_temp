
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { UserWallet } from './user_wallet.entity';
import { Transaction } from './transaction';
export enum UserRole{
 USER= "USER",
 ADMIN= "ADMIN"
}
@Entity()
export class UserAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({length:100, unique:true})
  email: string;

  @Column('text',{nullable:true})
  password_hash: string;

  @Column({type:'text',nullable:true})
  first_name: string;

  @Column({nullable:true})
  last_name: string;
  
  @Column("boolean")
  is_email_verified: boolean;

  @Column({enum:UserRole,default:UserRole.USER})
  role:UserRole

  @OneToMany(()=>Transaction,(transaction)=>transaction.user)
  transactions:Transaction[]
}
