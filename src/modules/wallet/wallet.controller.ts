import { Controller, Get, Post } from '@nestjs/common';

@Controller('wallet')
export class WalletController {
    @Get()
    async getWallet(){
        
    }

    @Post()
    async fundWallet(){

    }

    
    @Post()
    async convertWalletCurrencies(){

    }

    
    @Post()
    async tradeWithWallet(){

    }
}
