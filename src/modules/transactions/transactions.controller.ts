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
            data: resData.map(mp => ({ id: mp.id, type: mp.type, wallet_id: mp.wallet_id, ...convertLowerToHigherDenomitation({ value: mp.value, currency: mp.currency }) }))
        }
        return dto
    }
}
