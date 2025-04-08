import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { DateTime } from 'luxon';
import { HigherCurrencyEnum } from 'src/entities/enums';
import { GetExchangeRatesCurrencyPairsOkResponse } from './dtos';
import * as assert from 'assert';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ExchangeRatesService {
    base_url: string
    api_key: string
    ttl = 15
    expires_at: Date
    constructor(
        private httpService: HttpService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache) {
        this.base_url = process.env.EXCHANGERATE_API_BASE_URL!
        this.api_key = process.env.EXCHANGERATE_API_KEY!
    }

    async convertCurrencies(from_currency: HigherCurrencyEnum, to_currency: HigherCurrencyEnum) {
        let pair_key = `${from_currency}:${to_currency}`
        let rate =Number(await this.cacheManager.get(pair_key)) 

        if (!rate) {
            let res = await this.getPairsFromExchangeRatesremote(from_currency, to_currency)
            console.log(res)
            rate = res.conversion_rate
            await this.cacheManager.set(pair_key, rate)
            this.expires_at = DateTime.now().plus({ minute: this.ttl }).toJSDate()
        }
        return rate
    }

    async getPairsFromExchangeRatesremote(base: HigherCurrencyEnum, target: HigherCurrencyEnum) {
        try {
            let res = await this.httpService.axiosRef.get<any, AxiosResponse<GetExchangeRatesCurrencyPairsOkResponse, any>>(`/v6/${this.api_key}/pair/${base}/${target}`, {
                baseURL: this.base_url,
            });
            this.validateResponseGetPairsFromExchangeRatesremote(res.data)
            return res.data
        } catch (error) {
            console.log(error)
            throw new InternalServerErrorException("Failed to get conversion rate: ")
        }

    }

    validateResponseGetPairsFromExchangeRatesremote(res: GetExchangeRatesCurrencyPairsOkResponse) {
        try {
            assert(res.result === "success", "no 'success' field")
            assert(res.base_code, "no 'base_code' field")
            assert(res.target_code, "no 'target' field")
            assert(typeof res.conversion_rate === "number", "conversion rate must be a number")
        } catch (error) {
            throw new InternalServerErrorException("Return format error: ", error)
        }
    }
}
