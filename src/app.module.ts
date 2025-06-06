import { Module } from '@nestjs/common';
import { CacheModule } from "@nestjs/cache-manager"
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { FxModule } from './modules/fx/fx.module';
import { ScheduleModule } from "@nestjs/schedule";
import { TransactionsModule } from './modules/transactions/transactions.module';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { EventEmitterModule } from "@nestjs/event-emitter"
import { EmailModule } from './modules/dependency/email/email.module';
import { ConfigModule } from '@nestjs/config';
import { WalletModule } from './modules/wallet/wallet.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ExchangeRatesModule } from './modules/exchange-rates/exchange-rates.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot(),
    EventEmitterModule.forRoot({
      delimiter: '.',
    }),
    CacheModule.register({ isGlobal: true }),
    ScheduleModule.forRoot(),
    HttpModule,
    JwtModule.registerAsync({
      global: true,
      useFactory: async () => {
        let res: JwtModuleOptions = {
          secret: process.env.JWT_SECRET_KEY,
        }
        return res
      },
    }),
    AuthModule,
    WalletModule, FxModule, TransactionsModule, EmailModule, JobsModule, ExchangeRatesModule],
  controllers: [AppController],
  providers: [AppService,],
})
export class AppModule { }
