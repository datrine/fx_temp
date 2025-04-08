import * as assert from "assert";
import { HigherCurrencyEnum, LowerCurrencyEnum } from "../entities/enums";

export const getLowerDemonination = (currency: HigherCurrencyEnum): LowerCurrencyEnum => {
    let currency_ret: LowerCurrencyEnum
    switch (currency) {
        case HigherCurrencyEnum.NGN:
            currency_ret = LowerCurrencyEnum.KOBO
            break;
        case HigherCurrencyEnum.USD:
            currency_ret = LowerCurrencyEnum.US_CENT
            break;

        case HigherCurrencyEnum.EUR:
            currency_ret = LowerCurrencyEnum.EU_CENT;
            break;

        case HigherCurrencyEnum.GBP:
            currency_ret = LowerCurrencyEnum.PENCE
            break;
        default:
            throw new Error(`cannot fetch higher denomination of unknown currency ${currency}.`);
    }
    return currency_ret
}




export const getHigherDemonination = (currency: LowerCurrencyEnum ):  HigherCurrencyEnum => {
    let currency_ret: HigherCurrencyEnum
    switch (currency) {
        case LowerCurrencyEnum.KOBO:
            currency_ret = HigherCurrencyEnum.NGN
            break;

        case LowerCurrencyEnum.EU_CENT:
            currency_ret = HigherCurrencyEnum.EUR
            break;


        case LowerCurrencyEnum.US_CENT:
            currency_ret = HigherCurrencyEnum.USD
            break;

        case LowerCurrencyEnum.PENCE:
            currency_ret = HigherCurrencyEnum.GBP
            break;
        default:
            throw new Error(`cannot fetch higher denomination of unknown currency ${currency}.`);
    }
    return currency_ret 
}

export const convertHigherToLowerDenomitation = ({ currency, value }: { value: number; currency: HigherCurrencyEnum }): ({ value: number; currency: LowerCurrencyEnum }) => {
    assert(typeof value === "number", new Error(`cannot convert non-numeric value ${value}`))
    let value_ret = value * 100
    let currency_ret: LowerCurrencyEnum
    switch (currency) {
        case HigherCurrencyEnum.NGN:
            currency_ret = LowerCurrencyEnum.KOBO
            break;
        case HigherCurrencyEnum.USD:
            currency_ret = LowerCurrencyEnum.US_CENT
            break;

        case HigherCurrencyEnum.EUR:
            currency_ret = LowerCurrencyEnum.EU_CENT;
            break;

        case HigherCurrencyEnum.GBP:
            currency_ret = LowerCurrencyEnum.PENCE
            break;
        default:
            throw new Error(`cannot convert unknown currency ${currency}.`);
    }
    return { value: Math.round(value_ret) , currency: currency_ret }
}

export const convertLowerToHigherDenomitation = ({ currency, value }: { value: number; currency: LowerCurrencyEnum }): ({ value: number; currency: HigherCurrencyEnum }) => {
    assert(typeof value === "number", new Error(`cannot convert non-numeric value  ${value}`))
    let value_ret = Number((value / 100).toFixed(2))
    let currency_ret: HigherCurrencyEnum
    switch (currency) {
        case LowerCurrencyEnum.KOBO:
            currency_ret = HigherCurrencyEnum.NGN
            break;

        case LowerCurrencyEnum.EU_CENT:
            currency_ret = HigherCurrencyEnum.EUR
            break;


        case LowerCurrencyEnum.US_CENT:
            currency_ret = HigherCurrencyEnum.USD
            break;

        case LowerCurrencyEnum.PENCE:
            currency_ret = HigherCurrencyEnum.GBP
            break;
        default:
            throw new Error(`cannot convert unknown currency ${currency}.`);
    }
    return { value: value_ret, currency: currency_ret }
}

