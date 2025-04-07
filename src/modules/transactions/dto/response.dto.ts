import { ApiProperty } from "@nestjs/swagger";
import { CurrencyEnum, HigherCurrencyEnum, TransactionTypeEnum } from "../../../entities/enums";
import { ResponseBodyDTO } from "../../../utils/classes";

export class TransactionDTO{
    @ApiProperty({type:"number"})
    id: number;

    @ApiProperty({enum:TransactionTypeEnum})
    type: TransactionTypeEnum
    
    @ApiProperty({type:"number"})
    value: number
    
    @ApiProperty({enum:CurrencyEnum})
    currency: string
}

export class GetTransactionsOKResponseBodyDTO extends ResponseBodyDTO{
    data:Array<TransactionDTO>
}