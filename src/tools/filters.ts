import { isString, isNumber } from "../helpers";

export const filters = {
  maxLength: (length: number) => (value: string) =>
    isString(value) && value.length <= length ? value : value.substr(0, length),
  min: (min: number) => (value: number) => (isNumber(value) && value >= min ? value : min),
  max: (max: number) => (value: number) => (isNumber(value) && value <= max ? value : max)
  // toNumber: () => (value: string) => (isString(value) ? Number(value) : NaN)
};
