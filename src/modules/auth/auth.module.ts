import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EntityProviderModule } from '../../entity_provider/entity_provider.module';
import { EmailModule } from '../dependency/email/email.module';

@Module({
  imports:[EntityProviderModule,EmailModule],
  controllers: [AuthController],
  providers: [AuthService]
})
export class UserModule {}
