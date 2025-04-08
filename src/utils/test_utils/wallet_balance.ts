import { Repository } from "typeorm"
import { UserAccount, UserRole } from "../../entities/user_account.entity"
import { faker } from "@faker-js/faker/."
import { UserWallet } from "../../entities/user_wallet.entity"
import { givenUserInRepository } from "./user_account"
import { WalletBalance } from "../../entities/wallet_balance"
import { CurrencyDenomination, LowerCurrencyEnum } from "../../entities/enums"

export const givenWalletBalanceInRepository = async (walletBalanceRepository: Repository<UserWallet>) => {
    const walletBalance = new WalletBalance()
    walletBalance.currency = faker.helpers.arrayElement([
        LowerCurrencyEnum.KOBO,
        LowerCurrencyEnum.EU_CENT,
        LowerCurrencyEnum.PENCE,
        LowerCurrencyEnum.US_CENT])
    walletBalance.denomination = CurrencyDenomination.LOWER
    walletBalance.value = faker.number.int({ max: 1000_000_000, min: 0 })
    await walletBalanceRepository.save(walletBalance)
    return walletBalance
}

export const givenMultipleWalletBalanceInRepository = async (walletBalanceRepository: Repository<WalletBalance>) => {
    let walletBalances: Array<WalletBalance> = []
    for (let i = 0; i < 4; i++) {

        const walletBalance = new WalletBalance()
        walletBalance.currency = faker.helpers.arrayElement([
            LowerCurrencyEnum.KOBO,
            LowerCurrencyEnum.EU_CENT,
            LowerCurrencyEnum.PENCE,
            LowerCurrencyEnum.US_CENT])
        walletBalance.denomination = CurrencyDenomination.LOWER
        walletBalance.value = faker.number.int({ max: 1000_000_000, min: 0 })
        walletBalances.push(walletBalance)
    }
    await walletBalanceRepository.save(walletBalances)
    return walletBalances
}


export const givenMultipleWalletBalancesWithExistingUserWalletInRepository = async (walletBalanceRepository: Repository<WalletBalance>, userWallet: UserWallet) => {
    let walletBalances: Array<WalletBalance> = []
    for (let i = 0; i < 4; i++) {
        const walletBalance = new WalletBalance()
        walletBalance.currency = faker.helpers.arrayElement([
            LowerCurrencyEnum.KOBO,
            LowerCurrencyEnum.EU_CENT,
            LowerCurrencyEnum.PENCE,
            LowerCurrencyEnum.US_CENT])
        walletBalance.denomination = CurrencyDenomination.LOWER
        walletBalance.value = faker.number.int({ max: 1000_000_000, min: 0 })
        walletBalance.wallet = userWallet
        walletBalances.push(walletBalance)
    }
    await walletBalanceRepository.save(walletBalances)
    return walletBalances
}

export const givenMultipleWalletBalancesWithExistingUserAndUserWalletInRepository = async (walletBalanceRepository: Repository<WalletBalance>,user:UserAccount, userWallet: UserWallet) => {
    let walletBalances: Array<WalletBalance> = []
    for (let i = 0; i < 4; i++) {
    }
    for (const cur of [
            LowerCurrencyEnum.KOBO,
            LowerCurrencyEnum.EU_CENT,
            LowerCurrencyEnum.PENCE,
            LowerCurrencyEnum.US_CENT]) {
                const walletBalance = new WalletBalance()
                walletBalance.currency = faker.helpers.arrayElement([
                    LowerCurrencyEnum.KOBO,
                    LowerCurrencyEnum.EU_CENT,
                    LowerCurrencyEnum.PENCE,
                    LowerCurrencyEnum.US_CENT])
                walletBalance.denomination = CurrencyDenomination.LOWER
                walletBalance.value = faker.number.int({ max: 1000_000_000, min: 0 })
                walletBalance.wallet = userWallet
                walletBalance.user_account_id=user.id
                walletBalances.push(walletBalance)
    }
    await walletBalanceRepository.upsert(walletBalances,["user_account_id","currency"])
    return walletBalances
}

export const givenMultipleWalletBalancesWithExistingUserWalletWithUserInRepository = async (walletBalanceRepository: Repository<WalletBalance>, userWallet: UserWallet) => {
    let walletBalances: Array<WalletBalance> = []
    for (const cur of [
            LowerCurrencyEnum.KOBO,
            LowerCurrencyEnum.EU_CENT,
            LowerCurrencyEnum.PENCE,
            LowerCurrencyEnum.US_CENT]) {
        const walletBalance = new WalletBalance()
        walletBalance.currency = cur
        walletBalance.denomination = CurrencyDenomination.LOWER
        walletBalance.value = faker.number.int({ max: 1000_000_000, min: 0 })
        walletBalance.wallet = userWallet
        walletBalance.user_account_id=userWallet.user.id
        walletBalances.push(walletBalance)
    }
   return await walletBalanceRepository.save(walletBalances,)
}


export const givenMultipleSpecificWalletBalancesWithExistingUserWalletWithUserInRepository = async (walletBalanceRepository: Repository<WalletBalance>,currencies:Array<LowerCurrencyEnum>, userWallet: UserWallet) => {
    let walletBalances: Array<WalletBalance> = []
    for (const cur of currencies) {
        const walletBalance = new WalletBalance()
        walletBalance.currency = cur
        walletBalance.denomination = CurrencyDenomination.LOWER
        walletBalance.value = faker.number.int({ max: 1000_000_000, min: 0 })
        walletBalance.wallet = userWallet
        walletBalance.user_account_id=userWallet.user.id
        walletBalances.push(walletBalance)
    }
   return await walletBalanceRepository.save(walletBalances,)
}