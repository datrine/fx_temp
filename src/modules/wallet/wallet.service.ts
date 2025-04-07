import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserAccount } from '../../entities/user_account.entity';
import { WalletBalance } from '../../entities/wallet_balance';
import { USER_ACCOUNT_REPOSITORY, USER_WALLET_REPOSITORY, WALLET_BALANCE_REPOSITORY } from '../../entity_provider/constant';
import { Repository } from 'typeorm';

@Injectable()
export class WalletService {
    constructor(  @Inject(USER_ACCOUNT_REPOSITORY) private userAccountRepository: Repository<UserAccount>,
        @Inject(WALLET_BALANCE_REPOSITORY) private walletBalanceRepository: Repository<WalletBalance>,
        @Inject(USER_WALLET_REPOSITORY) private userWalletRepository: Repository<WalletBalance>,
        private eventEmitter: EventEmitter2,){}
      
    async fundWallet(){

    }
}
