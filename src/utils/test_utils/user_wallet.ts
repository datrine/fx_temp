import { Repository } from "typeorm"
import { UserAccount, UserRole } from "../../entities/user_account.entity"
import { faker } from "@faker-js/faker/."
import { UserWallet } from "../../entities/user_wallet.entity"
import { WalletBalance } from "../../entities/wallet_balance"
import {  givenMultipleSpecificWalletBalancesWithExistingUserWalletWithUserInRepository, givenMultipleWalletBalancesWithExistingUserWalletWithUserInRepository } from "./wallet_balance"
import { HigherCurrencyEnum, LowerCurrencyEnum } from "../../entities/enums"

export const givenUserWalletWithExistingUserNoBalanceInRepository =
    async (user: UserAccount, userWalletRepository: Repository<UserWallet>) => {
        const userWallet = new UserWallet()
        userWallet.user = user
        await userWalletRepository.save(userWallet)
        return userWallet
    }

//givenWalletBalanceInRepository

export const givenUserWalletWithExistingUserAndBalancesInRepository = async (
    userWalletRepository: Repository<UserWallet>,
    user: UserAccount, walletBalances: [WalletBalance]) => {
    const userWallet = new UserWallet()
    userWallet.user = user
    userWallet.balances = walletBalances
    await userWalletRepository.save(userWallet)
    return userWallet
}

//
export const givenUserWalletWithExistingUserAndCreatedMultipleBalancesInRepository = async (
    userWalletRepository: Repository<UserWallet>,
    walletBalanceRepository: Repository<WalletBalance>,
    user: UserAccount) => {
    const userWallet = new UserWallet()
    userWallet.user = user
    await userWalletRepository.save(userWallet)
    userWallet.balances = 
    await givenMultipleWalletBalancesWithExistingUserWalletWithUserInRepository(walletBalanceRepository,userWallet)
  return  await userWalletRepository.save(userWallet)
}


export const givenUserWalletWithExistingUserAndCreatedSpecificCurrencyBalancesInRepository = async (
    userWalletRepository: Repository<UserWallet>,
    walletBalanceRepository: Repository<WalletBalance>,
    user: UserAccount,currencies:Array<LowerCurrencyEnum>) => {
    const userWallet = new UserWallet()
    userWallet.user = user
    await userWalletRepository.save(userWallet)
    userWallet.balances = 
    await givenMultipleSpecificWalletBalancesWithExistingUserWalletWithUserInRepository(walletBalanceRepository,currencies,userWallet)
  return  await userWalletRepository.save(userWallet)
}