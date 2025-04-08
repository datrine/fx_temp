import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { USER_ACCOUNT_REPOSITORY } from '../../entity_provider/constant';

describe('UserService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).useMocker(token=>{
          if (token===USER_ACCOUNT_REPOSITORY) {
            return jest.fn()
          }
          else return jest.fn()
        }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
