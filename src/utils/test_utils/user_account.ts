import { Repository } from "typeorm"
import { UserAccount, UserRole } from "../../entities/user_account.entity"
import { faker } from "@faker-js/faker/."
import { createPasswordHash } from "../fn"

export const givenUserInRepository = async (userAccountRepository: Repository<UserAccount>) => {
    let password = faker.internet.password()
    let password_hash = await createPasswordHash(password)
    let user: UserAccount = await userAccountRepository.save({
        email: faker.internet.email(),
        password_hash,
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        is_email_verified: true,
        role: UserRole.USER
    })
    return user
}


export const givenUserWithUnverifiedEmailInRepository = async (userAccountRepository: Repository<UserAccount>) => {
    let password = faker.internet.password()
    let password_hash = await createPasswordHash(password)
    let user: UserAccount = await userAccountRepository.save({
        email: faker.internet.email(),
        password_hash,
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        is_email_verified: false,
        role: UserRole.USER
    })
    return user
}