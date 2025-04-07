import { HigherCurrencyEnum } from "src/entities/enums"

export type GetExchangeRatesCurrencyPairsOkResponse = {
    "result": "success",
    "documentation": string,
    "terms_of_use": string,
    "time_last_update_unix": number,
    "time_last_update_utc": string,
    "time_next_update_unix": number,
    "time_next_update_utc": string,
    "base_code": HigherCurrencyEnum,
    "target_code": HigherCurrencyEnum,
    "conversion_rate": number
}