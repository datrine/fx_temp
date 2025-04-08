import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ExchangeRatesService } from '../exchange-rates/exchange-rates.service';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { GetRatesOKResponseDTO } from './dto/response.dto';

@Controller('fx')
export class FxController {
    constructor(private exc: ExchangeRatesService) { }
    @Get("/rates")
    @ApiOperation({description:"Get rates of currency pairs"})
    @ApiOkResponse({type:GetRatesOKResponseDTO})
    async getRate() {
        let resData = await this.exc.getPairs()
        let dto:GetRatesOKResponseDTO = {
            statusCode:HttpStatus.OK,
            data: resData
        }
        return dto
    }
}
