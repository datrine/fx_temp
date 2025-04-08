import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { GetDatabaseSourceProvider, getDbContainer, teardownMySqlContainer } from '../../utils/test_utils/db_conn';
import { HttpModule } from '@nestjs/axios';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { TransactionEntityProvider } from '../../entity_provider/transaction_entity.provider';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let cont: StartedPostgreSqlContainer
  beforeAll(async () => {
     cont = await getDbContainer()
    let data_source = await GetDatabaseSourceProvider(cont)
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [TransactionsService, data_source,TransactionEntityProvider],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  },60000);

  afterAll(async () => {
    await teardownMySqlContainer(cont)
  }, 10000)
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
