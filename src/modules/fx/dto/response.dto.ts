import { ApiProperty } from "@nestjs/swagger"
import { HigherCurrencyEnum } from "../../../entities/enums"
import { ResponseBodyDTO } from "../../../utils/classes"

export class RatePairDTO{
    @ApiProperty({enum:HigherCurrencyEnum})
    first:HigherCurrencyEnum
    
    @ApiProperty({enum:HigherCurrencyEnum})
    second:HigherCurrencyEnum

    
    @ApiProperty({type:"number"})
    rate:number
}
export class GetRatesOKResponseDTO extends ResponseBodyDTO{
    @ApiProperty({type:[RatePairDTO]})
    data:Array<RatePairDTO>
}