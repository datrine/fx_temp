import { IsEnum, IsNumber, Min } from "class-validator";
import {  ApiProperty } from "@nestjs/swagger";
import { HigherCurrencyEnum } from "../../../entities/enums";

export class FundWalletRequestBodyDTO{
    @ApiProperty({type:"number"})
    @IsNumber()
    amount:number;

    @ApiProperty({enum:HigherCurrencyEnum})
    @IsEnum(HigherCurrencyEnum)
    currency:HigherCurrencyEnum.NGN;
}


export class TradeCurrenciesRequestBodyDTO{
    @ApiProperty({type:"number"})
    @IsNumber()
    amount:number;

    @ApiProperty({enum:HigherCurrencyEnum})
    @IsEnum(HigherCurrencyEnum)
    base:HigherCurrencyEnum;

    @ApiProperty({enum:HigherCurrencyEnum})
    @IsEnum(HigherCurrencyEnum)
    target:HigherCurrencyEnum;
}

export class ConvertCurrencyRequestBodyDTO{
    @ApiProperty({type:"number"})
    @IsNumber()
    amount:number;

    @ApiProperty({enum:HigherCurrencyEnum})
    @IsEnum(HigherCurrencyEnum)
    from:HigherCurrencyEnum;

    @ApiProperty({enum:HigherCurrencyEnum})
    @IsEnum(HigherCurrencyEnum)
    to:HigherCurrencyEnum;
}