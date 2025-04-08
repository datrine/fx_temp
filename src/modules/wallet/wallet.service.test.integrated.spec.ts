import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { EmailModule } from '../dependency/email/email.module';
import { GetDatabaseSourceProvider, getDbContainer, teardownMySqlContainer } from '../../utils/test_utils/db_conn';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { TransactionsService } from '../transactions/transactions.service';
import { TransactionEntityProvider } from '../../entity_provider/transaction_entity.provider';
import { ExchangeRatesModule } from '../exchange-rates/exchange-rates.module';
import { CacheModule } from '@nestjs/cache-manager';
import { UserWalletEntityProvider } from '../../entity_provider/user_wallet_entity.provider';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { UserAccount, UserRole } from '../../entities/user_account.entity';
import { DataSource, Repository } from 'typeorm';
import { givenUserInRepository } from '../../utils/test_utils/user_account';
import { givenUserWalletWithExistingUserAndCreatedMultipleBalancesInRepository, givenUserWalletWithExistingUserAndCreatedSpecificCurrencyBalancesInRepository } from '../../utils/test_utils/user_wallet';
import { WalletBalance } from '../../entities/wallet_balance';
import { UserWallet } from '../../entities/user_wallet.entity';
import { HigherCurrencyEnum, LowerCurrencyEnum } from '../../entities/enums';
import { UserAccountEntityProvider } from '../../entity_provider/user_account_entity.provider';
import { DATA_SOURCE, USER_ACCOUNT_REPOSITORY, USER_WALLET_REPOSITORY, WALLET_BALANCE_REPOSITORY } from '../../entity_provider/constant';
import { WalletBalanceEntityProvider } from '../../entity_provider/wallet_balance_entity.provider';
import { convertHigherToLowerDenomitation, convertLowerToHigherDenomitation, getHigherDemonination, getLowerDemonination } from '../../utils/currency_conversion_utils';

describe('WalletService', () => {
  let module: TestingModule
  let service: WalletService;
  let container: StartedPostgreSqlContainer

  beforeAll(async () => {
    container = await getDbContainer()
    let dbSourceProvider = GetDatabaseSourceProvider(container)
    module = await Test.createTestingModule({
      imports: [EmailModule, ExchangeRatesModule,
        CacheModule.register({ isGlobal: true }),
        EventEmitterModule.forRoot({ global: true })],
      providers: [
        WalletService,
        dbSourceProvider,
        TransactionsService,
        TransactionEntityProvider, UserAccountEntityProvider, UserWalletEntityProvider, WalletBalanceEntityProvider],
    }).compile();

    service = module.get<WalletService>(WalletService);
  }, 60000);

  afterAll(async () => {
    await teardownMySqlContainer(container)
  }, 10000)

  describe("Successfully fund wallet for existing user with valid amount and currency", () => {
    let db_source: DataSource
    let emitter: EventEmitter2
    let userAccountRepository: Repository<UserAccount>
    let userWalletRepository: Repository<UserWallet>
    let walletBalanceRepository: Repository<WalletBalance>
    let user: UserAccount
    let userNoWallet: UserAccount
    let userWalletWithSpecificBalances: UserWallet
    let specifiedCurrency: LowerCurrencyEnum = LowerCurrencyEnum.US_CENT
    beforeEach(async () => {
      userAccountRepository = module.get<Repository<UserAccount>>(USER_ACCOUNT_REPOSITORY)
      userWalletRepository = module.get<Repository<UserWallet>>(USER_WALLET_REPOSITORY)
      walletBalanceRepository = module.get<Repository<WalletBalance>>(WALLET_BALANCE_REPOSITORY)
      userNoWallet=await givenUserInRepository(userAccountRepository)
      user = await givenUserInRepository(userAccountRepository)
      userWalletWithSpecificBalances =
        await givenUserWalletWithExistingUserAndCreatedSpecificCurrencyBalancesInRepository(userWalletRepository, walletBalanceRepository, user, [specifiedCurrency])
      db_source = module.get<DataSource>(DATA_SOURCE)
       emitter = module.get<EventEmitter2>(EventEmitter2)
    })
    afterEach(async () => {
      await walletBalanceRepository.clear()
      await userWalletRepository.remove(userWalletWithSpecificBalances)
      await userAccountRepository.remove(user)
    })
    it("Retrieve existing user wallet with correct relations (balances and user)", async () => {
      let getOrCreateUserWalletSpy = jest.spyOn(service, "getOrCreateUserWallet")
      let result = await service.fundWallet(user.id, { amount: 1000, currency: HigherCurrencyEnum.EUR })
      expect(getOrCreateUserWalletSpy).toHaveBeenCalled()
    })

    it("Update the specific currency balance with the provided amount", async () => {
      let amount = 1000;
      let currency = getHigherDemonination(specifiedCurrency)
      let expected_bal = userWalletWithSpecificBalances.balances.find(dt => dt.currency === specifiedCurrency)!
      let expected_bal_val = convertLowerToHigherDenomitation({ value: expected_bal.value!, currency: specifiedCurrency }).value + amount //expected_bal?.value!+convertHigherToLowerDenomitation({currency,value:amount}).value
      let result = await service.fundWallet(user.id, { amount, currency })
      expect(result).toBeTruthy()
      expect(result.balances).toEqual(expect.arrayContaining([expect.objectContaining({ currency })]))
      let bal = result.balances.find(dt => dt.currency === currency)
      expect(bal?.value).toEqual(expected_bal_val)
    })

    it("Return a properly formatted wallet object with updated balance information", async () => {
      let amount = 1000;
      let currency = getHigherDemonination(specifiedCurrency)
      let result = await service.fundWallet(user.id, { amount, currency })
      expect(result).toBeTruthy()
      expect(result.user_id).toBeTruthy()
      expect(result.user_id === user.id).toBe(true)
      expect(result.wallet_id).toBeTruthy()
      expect(result.wallet_id === userWalletWithSpecificBalances.id).toBe(true)
      expect(result.balances).toBeTruthy()
      expect(Array.isArray(result.balances)).toBe(true)
      expect(result.balances.length > 0).toBe(true)
      expect(result.balances).toEqual(expect.arrayContaining([expect.objectContaining({ currency })]))
    })

    it("Complete the entire operation within a database transaction for data integrity", async () => {
      let amount = 1000;
      let currency = getHigherDemonination(specifiedCurrency)
      let transactionSpy = jest.spyOn(db_source, "transaction")
      let getOrCreateUserWalletSpy = jest.spyOn(service, "getOrCreateUserWallet")
      let result = await service.fundWallet(user.id, { amount, currency })
      expect(result).toBeTruthy()
      expect(transactionSpy).toHaveBeenCalled()
      expect(getOrCreateUserWalletSpy).toHaveBeenCalledWith(expect.anything(), expect.anything())
    })

    it("Create new wallet if user doesn't have one yet", async () => {
      let amount = 1000;
      let currency = getHigherDemonination(specifiedCurrency)
      let transactionSpy = jest.spyOn(db_source, "transaction")
      let getOrCreateUserWalletSpy = jest.spyOn(service, "getOrCreateUserWallet")
      let createUserWalletSpy = jest.spyOn(service, "createUserWallet")
      let createOrGetWalletBalancesSpy = jest.spyOn(service, "createOrGetWalletBalances")
      let result = await service.fundWallet(userNoWallet.id, { amount, currency })
      expect(result).toBeTruthy()
      expect(transactionSpy).toHaveBeenCalled()
      expect(getOrCreateUserWalletSpy).toHaveBeenCalledWith(expect.anything(), expect.anything())
      expect(createUserWalletSpy).toHaveBeenCalledWith(expect.anything(), expect.anything())
      expect(createOrGetWalletBalancesSpy).toHaveBeenCalledWith(expect.anything(), expect.anything())
    })

    it("Add funds to the correct currency balance",async()=>{
      let amount = 1000;
      let currency = getHigherDemonination(specifiedCurrency)
      let expected_bal = userWalletWithSpecificBalances.balances.find(dt => dt.currency === specifiedCurrency)!
      let expected_bal_val = convertLowerToHigherDenomitation({ value: expected_bal.value!, currency: specifiedCurrency }).value + amount //expected_bal?.value!+convertHigherToLowerDenomitation({currency,value:amount}).value
      let result = await service.fundWallet(user.id, { amount, currency })
      expect(result).toBeTruthy()
      expect(result.balances).toEqual(expect.arrayContaining([expect.objectContaining({ currency })]))
      let bal = result.balances.find(dt => dt.currency === currency)
      expect(bal?.value).toEqual(expected_bal_val)
    })

    it("Emit WalletFundedEvent with correct payload",async()=>{
      let amount = 1000;
      let currency = getHigherDemonination(specifiedCurrency)
      let emitSpy = jest.spyOn(emitter, "emit")
      let result = await service.fundWallet(user.id, { amount, currency })
      expect(result).toBeTruthy()
      expect(emitSpy).toHaveBeenCalled()
    })

    it("should not allow zero amount funding",async()=>{
      let amount = 0;
      let currency = getHigherDemonination(specifiedCurrency)
     await expect(  service.fundWallet(user.id, { amount, currency })).rejects.toThrow()
    })
    
    it("should not allow negative amount funding",async()=>{
      let amount = -1000;
      let currency = getHigherDemonination(specifiedCurrency)
     await expect(  service.fundWallet(user.id, { amount, currency })).rejects.toThrow()
    })

    it("should not allow unreasonably large amount funding",async()=>{
      let amount = Number.MAX_SAFE_INTEGER+1;
      let currency = getHigherDemonination(specifiedCurrency)
     await expect(  service.fundWallet(user.id, { amount, currency })).rejects.toThrow()
    })

    it("should not allow if currency is not valid",async()=>{
      let non_existing_user_id=3000
      let amount = 1000;
      let currency = "IS_VALID_CURRENCY" as any
     await expect(  service.fundWallet(non_existing_user_id, { amount, currency })).rejects.toThrow()
    })
    
    it("should not allow is user does not exist",async()=>{
      let non_existing_user_id=3000
      let amount = 1000;
      let currency = getHigherDemonination(specifiedCurrency)
     await expect(  service.fundWallet(non_existing_user_id, { amount, currency })).rejects.toThrow()
    })
  })
});
