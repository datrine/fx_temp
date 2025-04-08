import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { EntityProviderModule } from '../../entity_provider/entity_provider.module';
import { EmailModule } from '../dependency/email/email.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { USER_ACCOUNT_REPOSITORY } from '../../entity_provider/constant';

describe('WalletController', () => {
  let controller: WalletController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.registerAsync({
          global: true,
          useFactory: async () => {
            let res: JwtModuleOptions = {
              secret: process.env.JWT_SECRET_KEY,
            }
            return res
          },
        })],
      controllers: [WalletController],
      providers: []
    }).useMocker(token=>{
      if (token===USER_ACCOUNT_REPOSITORY) {
        return jest.fn()
      }
      else return jest.fn()
    }).compile();

    controller = module.get<WalletController>(WalletController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
