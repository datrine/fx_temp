import { Body, Controller, Get, Post, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { AuthGuard, AuthRequest } from '../../guards/auth.guard';
import { FundWalletRequestBodyDTO } from './dtos/request.dto';
import { EmailVerifiedGuard } from '../../guards/email_verified.guard';

@Controller('wallet')
@UseGuards(AuthGuard)
export class WalletController {
    constructor(private walletService:WalletService){}
    @Get("")
    @UseGuards(AuthGuard)
    async getWallet(@Req()authReq:AuthRequest,){
        let resData=await this.walletService.getUserWallet(authReq.user.id)
        return {data:resData}
    }

    @Post("fund")
    async fundWallet(@Req()authReq:AuthRequest,@Body(new ValidationPipe({transform:true}))bodyData:FundWalletRequestBodyDTO){
        let resData=await this.walletService.fundWallet(authReq.user.id,bodyData)
        return {data:resData}
    }

    
    @Post()
    async convertWalletCurrencies(){

    }

    
    @Post("trade")
    @UseGuards(EmailVerifiedGuard)
    async tradeWithWallet(@Req()authReq:AuthRequest,){

    }
}
