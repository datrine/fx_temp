import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/auth/auth.module';
import { FxModule } from './modules/fx/fx.module';
import { TransactionsService } from './modules/transactions/transactions.service';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import {EventEmitterModule} from "@nestjs/event-emitter"
import { EmailModule } from './modules/dependency/email/email.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    EventEmitterModule.forRoot({
      delimiter: '.',
    }),
    JwtModule.registerAsync({
          global: true,
      useFactory: async () => {
        let res: JwtModuleOptions = {
          secret: process.env.JWT_SECRET_KEY,
        }
        return res
      },
    }),UserModule, FxModule, TransactionsModule, EmailModule],
  controllers: [AppController],
  providers: [AppService, TransactionsService],
})
export class AppModule {}
