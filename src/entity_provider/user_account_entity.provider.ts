import { Module, Provider } from '@nestjs/common';
import { UserAccount } from '../entities/user_account.entity';
import { DataSource } from 'typeorm';
import { USER_ACCOUNT_REPOSITORY, DATA_SOURCE } from './constant';
import { DatabaseModule } from '../database/database.module';

export const UserAccountEntityProvider: Provider = {
    provide: USER_ACCOUNT_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(UserAccount),
    inject: [DATA_SOURCE],
}
