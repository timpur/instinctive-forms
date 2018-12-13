import { FormValidation, TPrimitive, FormErrors, FormFilters } from "../types";

// import * as dotProp from "dot-prop-immutable";

// ---- Helpers ---- //
export const isNullOrUndefined = value => value === null || value === undefined;
export const isArray = value => !isNullOrUndefined(value) && Array.isArray(value);
export const isObject = value => !isNullOrUndefined(value) && typeof value === "object" && !isArray(value);
export const isString = value => !isNullOrUndefined(value) && typeof value === "string";
export const isNumber = value => !isNullOrUndefined(value) && typeof value === "number";
export const isBoolean = value => !isNullOrUndefined(value) && typeof value === "boolean";
export const isEmptyArray = value => isArray(value) && value.length === 0;
export const isEmptyObject = value => isObject(value) && Object.keys(value).length === 0;
export const isEmptyValue = value => value === undefined || isEmptyArray(value) || isEmptyObject(value) || value === "";

export const buildPath = (...args: string[]) => args.filter(item => !!item).join(".");

export const runValidation: (validations: Array<FormValidation>, value: TPrimitive) => FormErrors = (
  validations = [],
  value
) => validations.map(validation => validation(value)).filter(error => !!error);

export const runFilters: (filters: FormFilters, value: TPrimitive) => TPrimitive = (filters = [], value) =>
  filters.reduce((v, f) => f(v), value);

export const valueChanged = (a: any, b: any) => a !== b;
export const arrayChanged = (a: any[], b: any[]) => {
  if ((a && !b) || (!a && b)) return true;
  else if (isArray(a) && isArray(b)) return a.some((item, index) => valueChanged(item, b[index]));
  else return false;
};

export class ChangeDetection<T = any> {
  private previousValue;
  private validator = (a: T, b: T) => a !== b;

  constructor(initialValue: T = null, validator?: (a: T, b: T) => boolean) {
    this.previousValue = initialValue;
    if (validator) this.validator = validator;
  }

  check(value: T) {
    if (this.validator(this.previousValue, value)) {
      this.previousValue = value;
      return true;
    }
    return false;
  }
}

// Needed ?

// ---- Types ---- //
// export type ElementEvent<TElement = HTMLElement> = Event & { target: TElement };

// export const valueChangedKey = (a: any, b: any, path: string) =>
//   valueChanged(dotProp.get(a, path), dotProp.get(b, path));

// export const getValueFromEvent = (e: ElementEvent<any>) => e.target.value;
// export const getValueFromEventBind = (cb: (value: any) => any) => (e: ElementEvent<any>) => cb(getValueFromEvent(e));
