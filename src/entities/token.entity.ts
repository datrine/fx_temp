
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
export enum TokenScope{
  EMAIL_VERIFICATION="EMAIL_VERIFICATION"
}
@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({length:6})
  token: string;

  @Column({enum:TokenScope})
  scope: TokenScope;

  @Column({length:100})
  recipient: string;

  @Column("timestamp")
  expires_at: Date;
  
  @Column("boolean",{default:false})
  is_used: boolean;
}
