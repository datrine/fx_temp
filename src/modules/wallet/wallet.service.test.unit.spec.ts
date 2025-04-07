import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { TransactionsService } from '../transactions/transactions.service';
import { ExchangeRatesModule } from '../exchange-rates/exchange-rates.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { EntityProviderModule } from '../../entity_provider/entity_provider.module';
import { DATA_SOURCE, USER_ACCOUNT_REPOSITORY, USER_WALLET_REPOSITORY, WALLET_BALANCE_REPOSITORY } from '../../entity_provider/constant';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ExchangeRatesService } from '../exchange-rates/exchange-rates.service';
import { UserWallet } from '../../entities/user_wallet.entity';
import { WalletBalance } from '../../entities/wallet_balance';
import { UserAccount } from '../../entities/user_account.entity';
import { LowerCurrencyEnum } from '../../entities/enums';

describe('WalletService', () => {
  describe("createWallet", () => {

    describe("Returns a user wallet when it exists with balances", () => {
      let service: WalletService;

      const userId = 1;

      const mockUserWallet = {
        id: 123,
        user: { id: userId },
        balances: [{ currency: 'USD', amount: 100 }]
      };
      const mockFormattedWallet = { id: 123, balances: [{ currency: 'USD', amount: '100.00' }] };

      const mockManager = {
        transaction: jest.fn().mockImplementation(callback => callback({ getRepository: jest.fn() }))
      };

      const mockDataSource = {
        manager: mockManager
      };

      const mockUserWalletRepository = {
        findOne: jest.fn().mockResolvedValue(mockUserWallet)
      };

      beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
          imports: [],
          providers: [WalletService],
        }).useMocker(token => {
          if (token === DATA_SOURCE) {
            return mockDataSource
          }
          else if (token === USER_WALLET_REPOSITORY) {
            return mockUserWalletRepository
          }
          else {
            return jest.fn()
          }
        }).compile();
        service = module.get<WalletService>(WalletService);

        service['formatWallet'] = jest.fn().mockReturnValue(mockFormattedWallet);

      });
      it("should return formatted wallet when user wallet exists with balances", async () => {
        const userId = 1;
        // Act
        const result = await service.getUserWallet(userId);
        expect(mockUserWalletRepository.findOne).toHaveBeenCalledWith({
          where: { user: { id: userId } },
          relations: { user: true, balances: true }
        });
        expect(service['formatWallet']).toHaveBeenCalledWith(mockUserWallet);
        expect(result).toEqual(mockFormattedWallet);
      })
    })

    describe("Handles case when user wallet is not found", () => {
      let service: WalletService;
      const userId = 1;
      const mockCreatedWallet = {
        id: 123,
        user: { id: userId },
        balances: [{ currency: 'USD', amount: 0 }]
      };
      const mockFormattedWallet = { id: 123, balances: [{ currency: 'USD', amount: '0.00' }] };

      const mockTransaction = jest.fn().mockImplementation(callback => callback({ getRepository: jest.fn() }));

      const mockDataSource = {
        manager: {
          transaction: mockTransaction
        }
      };

      const mockUserWalletRepository = {
        findOne: jest.fn().mockResolvedValue(null)
      };

      beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
          imports: [],
          providers: [WalletService],
        }).useMocker(token => {
          if (token === DATA_SOURCE) {
            return mockDataSource
          }
          else if (token === USER_WALLET_REPOSITORY) {
            return mockUserWalletRepository
          }
          else {
            return jest.fn()
          }
        }).compile();
        service = module.get<WalletService>(WalletService);

        service['datasource'] = mockDataSource as any;
        service['userWalletRepository'] = mockUserWalletRepository as any;
        service['createUserWallet'] = jest.fn().mockResolvedValue(mockCreatedWallet);
        service['formatWallet'] = jest.fn().mockReturnValue(mockFormattedWallet);

      });
      it('should create a new wallet when user wallet is not found', async () => {

        const result = await service.getUserWallet(userId);
        expect(mockUserWalletRepository.findOne).toHaveBeenCalledWith({
          where: { user: { id: userId } },
          relations: { user: true, balances: true }
        });
        expect(service['createUserWallet']).toHaveBeenCalledWith(userId, expect.anything());
        expect(service['formatWallet']).toHaveBeenCalledWith(mockCreatedWallet);
        expect(result).toEqual(mockFormattedWallet);
      });
    })

    describe("Creates wallet balances when wallet exists but has no balances", () => {
      let service: WalletService;
      const userId = 1;
      const mockUser = {
        id: userId,
        email: "test@test.com"
      }

      const mockCreatedWalletNoBalance = {
        id: 123,
        user: { id: userId },
        balances: undefined
      };
      const mockCreatedWallet = {
        id: 123,
        user: { id: userId },
        balances: [{ currency: 'USD', amount: 0 }]
      };
      const mockFormattedWallet = { id: 123, balances: [{ currency: 'USD', amount: '0.00' }] };

      const mockUserAccountRepository = {
        findOne: jest.fn().mockResolvedValue(mockUser)
      };

      const mockWalletBalanceRepository = { create: jest.fn().mockReturnValue({}) };

      const mockUserWalletRepository = {
        findOne: jest.fn().mockResolvedValue(mockCreatedWalletNoBalance),
        create: jest.fn().mockReturnValue(mockCreatedWalletNoBalance)
      };
      const mockGetRepository = jest.fn().mockImplementation((token) => {
        if (token === UserWallet) {
          return mockUserWalletRepository
        } else if (token === UserAccount) {
          return mockUserAccountRepository
        } else if (token === WalletBalance) {
          return mockWalletBalanceRepository
        }
      });
      const mockTransaction = {
        bind: jest.fn().mockReturnValue({
          getRepository: mockGetRepository,
          save: jest.fn().mockReturnValue(mockCreatedWallet)
        })
      }
      const mockDataSource = {
        manager: {
          transaction: mockTransaction,
          getRepository: mockGetRepository
        }
      };


      beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
          imports: [],
          providers: [WalletService],
        }).useMocker(token => {
          if (token === DATA_SOURCE) {
            return mockDataSource
          }
          else if (token === USER_WALLET_REPOSITORY) {
            return mockUserWalletRepository
          }
          else {
            return jest.fn()
          }
        }).compile();
        service = module.get<WalletService>(WalletService);

        //service['datasource'] = mockDataSource as any;
        service['userWalletRepository'] = mockUserWalletRepository as any;
        //service["createOrGetWalletBalances"] = jest.fn().mockResolvedValue(mockCreatedWallet);
        service['formatWallet'] = jest.fn().mockReturnValue(mockFormattedWallet);

      });
      it("Checks if wallet.balances is empty or undefined before creating balances", async () => {
        let spy = jest.spyOn(service, "createOrGetWalletBalances")
        let result = await service.createUserWallet(userId)
        expect(spy).toHaveBeenCalled()
        expect(spy).toHaveReturned()
        console.log({ result })
        expect(result.balances).toBeTruthy()
      })
    })
  })

  describe("", () => {
    describe("Successfully adds value to an existing wallet balance", () => {
      let service: WalletService;
      let user_id = 1
      let wallet_id = 1
      const kobo_balance=1000
      const mockUser = {
        id: user_id,
        email: "test@test.com"
      }

      const mockWalletBalance = {
        id: 1,
        currency: "KOBO",
        value: kobo_balance
      };

      const mockWallet = {
        id: 1,
        user: { id: user_id },
        balances: [mockWalletBalance]
      };

      const mockFormattedWallet = { id: 123, balances: [mockWalletBalance] };

      const mockUserAccountRepository = {
        findOne: jest.fn().mockResolvedValue(mockUser)
      };
      const mockWalletBalanceRepository = { findOne: jest.fn().mockReturnValue(mockWalletBalance) };
      const mockUserWalletRepository = {
        findOne: jest.fn().mockResolvedValue(mockWallet),
      };
      const mockGetRepository = jest.fn().mockImplementation((token) => {
        if (token === UserWallet) {
          return mockUserWalletRepository
        } else if (token === UserAccount) {
          return mockUserAccountRepository
        } else if (token === WalletBalance) {
          return mockWalletBalanceRepository
        }
      });
      const mockSave = jest.fn();
      const mockTransaction = {
        bind: jest.fn().mockReturnValue({
          getRepository: mockGetRepository,
          save: mockSave
        })
      }
      const mockDataSource = {
        manager: {
          transaction: mockTransaction,
          getRepository: mockGetRepository
        }
      };
      beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
          imports: [],
          providers: [WalletService],
        }).useMocker(token => {
          if (token === DATA_SOURCE) {
            return mockDataSource
          }
          else if (token === USER_WALLET_REPOSITORY) {
            return mockUserWalletRepository
          }
          else {
            return jest.fn()
          }
        }).compile();
        service = module.get<WalletService>(WalletService);
        service['formatWallet'] = jest.fn().mockReturnValue(mockFormattedWallet);
      });
      it("Adds positive value to an existing wallet balance", async () => {
        let increment_value=5000
        let result = await service.addToWalletBalance(wallet_id, {
          user_account_id: user_id,
          increment_value,
          currency: LowerCurrencyEnum.KOBO
        })
        expect(mockSave).toHaveBeenCalledWith(mockWalletBalance)
        expect(mockWallet.balances).toEqual(
          expect.arrayContaining([expect.objectContaining({currency:"KOBO"})])
         )
         let bal=mockWallet.balances.find(dt=>dt.currency==="KOBO")
        expect(kobo_balance+increment_value).toEqual(bal?.value)
      })
      it("Returns the updated wallet balance object with the new value", async () => {

      })
      it("Updates the updated_at timestamp when adding to an existing balance",async()=>{})
    })
  })

});
