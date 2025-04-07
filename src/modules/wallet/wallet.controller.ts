import { Body, Controller, Get, Post, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { AuthGuard, AuthRequest } from '../../guards/auth.guard';
import { ConvertCurrencyRequestBodyDTO, FundWalletRequestBodyDTO, TradeCurrenciesRequestBodyDTO } from './dtos/request.dto';
import { EmailVerifiedGuard } from '../../guards/email_verified.guard';

@Controller('wallet')
@UseGuards(AuthGuard)
export class WalletController {
    constructor(private walletService: WalletService) { }
    @Get("")
    @UseGuards(AuthGuard)
    async getWallet(@Req() authReq: AuthRequest,) {
        let resData = await this.walletService.getUserWallet(authReq.user.id)
        return { data: resData }
    }

    @Post("fund")
    async fundWallet(@Req() authReq: AuthRequest, @Body(new ValidationPipe({ transform: true })) bodyData: FundWalletRequestBodyDTO) {
        let resData = await this.walletService.fundWallet(authReq.user.id, bodyData)
        return { data: resData }
    }


    @Post()
    async convertWalletCurrencies() {

    }


    @Post("trade")
    @UseGuards(EmailVerifiedGuard)
    async tradeWithWallet(@Req() authReq: AuthRequest, @Body(new ValidationPipe({transform:true})) bodyData: TradeCurrenciesRequestBodyDTO) {
        let resData = await this.walletService.trade(authReq.user.id, bodyData)
        let dto={
            data:resData
        }
        return dto
    }


    @Post("convert")
    async convert(@Req() authReq: AuthRequest, @Body(new ValidationPipe({ transform: true })) bodyData: ConvertCurrencyRequestBodyDTO) {
        let resData = await this.walletService.convertCurrencies(bodyData.amount, bodyData.from, bodyData.to)
        let dto = {
            data: resData
        }
        return dto
    }
}
