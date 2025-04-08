import { Body, Controller, Get, HttpStatus, Post, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { AuthGuard, AuthRequest } from '../../guards/auth.guard';
import { ConvertCurrencyRequestBodyDTO, FundWalletRequestBodyDTO, TradeCurrenciesRequestBodyDTO } from './dtos/request.dto';
import { EmailVerifiedGuard } from '../../guards/email_verified.guard';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FundWalletOKResponseBodyDTO, GetWalletOKResponseBodyDTO } from './dtos/response.dto';

@Controller('wallet')
@ApiTags("Wallet APIs")
@UseGuards(AuthGuard)
export class WalletController {
    constructor(private walletService: WalletService) { }
    @Get("")
    @UseGuards(AuthGuard)
    @ApiOperation({description:"Get user's wallet info",summary:"Get user's wallet info"})
    @ApiOkResponse({type:GetWalletOKResponseBodyDTO})
    async getWallet(@Req() authReq: AuthRequest,) {
        let resData = await this.walletService.fetchUserWallet(authReq.user.id)
        let dto: GetWalletOKResponseBodyDTO = {
            statusCode: HttpStatus.OK,
            data: resData
        }
        return dto
    }

    @Post("fund")
    @ApiOperation({description:"Fund user's wallet",summary:"Fund user's wallet info"})
    @ApiBearerAuth()
    @ApiOkResponse({type:FundWalletOKResponseBodyDTO})
    async fundWallet(@Req() authReq: AuthRequest, @Body(new ValidationPipe({ transform: true })) bodyData: FundWalletRequestBodyDTO) {
        let resData = await this.walletService.fundWallet(authReq.user.id, bodyData)
        let dto: FundWalletOKResponseBodyDTO = {
            statusCode: HttpStatus.OK,
            data: resData
        }
        return dto
    }

    @Post("trade")
    @ApiOperation({description:"Trade currency",summary:"Trade currency"})
    @ApiBearerAuth()
    @UseGuards(EmailVerifiedGuard)
    async tradeWithWallet(@Req() authReq: AuthRequest, @Body(new ValidationPipe({ transform: true })) bodyData: TradeCurrenciesRequestBodyDTO) {
        let resData = await this.walletService.trade(authReq.user.id, {
            sending:bodyData.base,
            receiving:bodyData.target,
            amount:bodyData.amount,
            second_trader_id:bodyData.second_trader_id
        })
        let dto = {
            data: resData
        }
        return dto
    }

    @Post("convert")
    @ApiOperation({description:"Convert currency",summary:"Convert currency"})
    @ApiBearerAuth()
    async convert(@Req() authReq: AuthRequest,
        @Body(new ValidationPipe({ transform: true })) bodyData: ConvertCurrencyRequestBodyDTO) {
        let resData = await this.walletService.convertCurrencies(
            authReq.user.id,
            bodyData.amount, bodyData.to, bodyData.from)
        let dto = {
            data: resData
        }
        return dto
    }
}
