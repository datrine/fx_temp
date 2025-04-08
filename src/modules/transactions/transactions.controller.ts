import { Controller, Get, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { GetTransactionsOKResponseBodyDTO } from './dto/response.dto';
import { convertLowerToHigherDenomitation } from 'src/utils/currency_conversion_utils';
import { AuthGuard, AuthRequest } from '../../guards/auth.guard';

@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionsController {
    constructor(private transactionService: TransactionsService) { }

    @Get("")
    async getTransactions(@Req()authReq:AuthRequest) {
        let resData = await this.transactionService.getTransactions()

        let dto: GetTransactionsOKResponseBodyDTO = {
            statusCode: HttpStatus.OK,
            data: resData.map(mp => ({ 
                id: mp.id, 
                user_account_id:mp.user_account_id,
                initiating_trader_account_id:mp.initiating_trader_account_id,
                second_trader_account_id:mp.second_trader_account_id,
                type: mp.type, 
                wallet_id: mp.wallet_id, 
                value: mp.value, 
                currency: mp.currency,
                status:mp.status,
                rate:mp.rate,
                base_currency:mp.base_currency,
                counter_currency:mp.counter_currency,
                created_at:mp.created_at,
                updated_at:mp.updated_at,
              }))
        }
        return dto
    }
}
