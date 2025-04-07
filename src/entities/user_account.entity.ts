
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
export enum UserRole{
  "USER",
  "ADMIN"
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
}
