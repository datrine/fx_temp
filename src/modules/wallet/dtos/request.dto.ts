import { IsEnum, IsNumber, Min } from "class-validator";
import {  ApiProperty } from "@nestjs/swagger";
import { HigherCurrencyEnum } from "../../../entities/enums";

export class FundWalletRequestBodyDTO{
    @IsNumber()
    amount:number;

    @ApiProperty({enum:HigherCurrencyEnum})
    @IsEnum(HigherCurrencyEnum)
    currency:HigherCurrencyEnum;
}