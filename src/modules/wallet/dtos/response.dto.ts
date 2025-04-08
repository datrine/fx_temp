import { IsEnum, IsNumber, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { HigherCurrencyEnum } from "../../../entities/enums";
import { ResponseBodyDTO } from "../../../utils/classes";

export class WalletBalanceDTO {

    @ApiProperty({ type: "number" })
    value: number;

    @ApiProperty({ enum: HigherCurrencyEnum })
    currency: string
}

export class WalletDTO {
    @ApiProperty({ type: "integer" })
    wallet_id: number;

    @ApiProperty({ type: "integer" })
    user_id: number;

    @ApiProperty({ type: [WalletBalanceDTO] })
    balances: Array<WalletBalanceDTO>
}

export class GetWalletOKResponseBodyDTO extends ResponseBodyDTO {
    @ApiProperty({ type: WalletDTO})
    @IsNumber()
    data: WalletDTO
}
export class FundWalletOKResponseBodyDTO extends ResponseBodyDTO {
    @ApiProperty({ type: WalletDTO})
    @IsNumber()
    data: WalletDTO
}


export class TradeCurrenciesRequestBodyDTO {
    @ApiProperty({ type: "number" })
    @IsNumber()
    amount: number;

    @ApiProperty({ enum: HigherCurrencyEnum })
    @IsEnum(HigherCurrencyEnum)
    base: HigherCurrencyEnum;

    @ApiProperty({ enum: HigherCurrencyEnum })
    @IsEnum(HigherCurrencyEnum)
    target: HigherCurrencyEnum;
}

export class ConvertCurrencyRequestBodyDTO {
    @ApiProperty({ type: "number" })
    @IsNumber()
    amount: number;

    @ApiProperty({ enum: HigherCurrencyEnum })
    @IsEnum(HigherCurrencyEnum)
    from: HigherCurrencyEnum;

    @ApiProperty({ enum: HigherCurrencyEnum })
    @IsEnum(HigherCurrencyEnum)
    to: HigherCurrencyEnum;
}