import { Module, Provider } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DATA_SOURCE, TOKEN_REPOSITORY, } from './constant';
import { Token } from '../entities/token.entity';

export const TokenEntityProvider: Provider = {
    provide: TOKEN_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Token),
    inject: [DATA_SOURCE],
}
