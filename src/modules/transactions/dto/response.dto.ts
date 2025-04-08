import { ApiProperty } from "@nestjs/swagger";
import { CurrencyEnum, HigherCurrencyEnum, TransactionStatusEnum, TransactionTypeEnum } from "../../../entities/enums";
import { ResponseBodyDTO } from "../../../utils/classes";

export class TransactionDTO{
    @ApiProperty({type:"number"})
    id: number;

    
    @ApiProperty({type:"number"})
    user_account_id?: number
    
    @ApiProperty({type:"number"})
    initiating_trader_account_id?:number

    @ApiProperty({type:"number"})
    second_trader_account_id?: number

    @ApiProperty({enum:TransactionTypeEnum})
    type: TransactionTypeEnum
    
    @ApiProperty({type:"number"})
    value?: number
    
    @ApiProperty({enum:CurrencyEnum})
    currency?: string
    
    @ApiProperty({enum:TransactionStatusEnum})
    status: string
    
    @ApiProperty({type:"number"})
    rate?: number

    @ApiProperty({enum:CurrencyEnum})
    base_currency?: string

    @ApiProperty({enum:CurrencyEnum})
    counter_currency?: string

    @ApiProperty({type:"string",format:"date-time"})
    created_at: Date

    @ApiProperty({type:"string",format:"date-time"})
    updated_at?: Date
}

export class GetTransactionsOKResponseBodyDTO extends ResponseBodyDTO{
    data:Array<TransactionDTO>
}