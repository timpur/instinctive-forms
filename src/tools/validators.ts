import { isNullOrUndefined, isString } from "../helpers";
import { TPrimitive } from "../types";

const textOnly = /^[a-zA-Z]+$/;
const numberOnly = /^[0-9]+$/;

export const validators = {
  required: (message: string) => (value: TPrimitive) => (!isNullOrUndefined(value) ? null : message),
  pattern: (message: string, pattern: RegExp) => value => (isString(value) && pattern.test(value) ? null : message),
  text: (message: string) => (value: string) => (isString(value) && textOnly.test(value) ? null : message),
  number: (message: string) => (value: string) => (isString(value) && numberOnly.test(value) ? null : message)
};
