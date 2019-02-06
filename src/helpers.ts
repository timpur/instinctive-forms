import { FormValidation, TPrimitive, FormErrors, FormFilters, TStoreValue } from "./types";

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
  else if (isArray(a) && isArray(b)) {
    if (a.length !== b.length) return true;
    return a.some((item, index) => valueChanged(item, b[index]));
  } else return false;
};
export const objectChanged = (a: object, b: object) => {
  if ((a && !b) || (!a && b)) return true;
  else if (isObject(a) && isObject(b)) {
    const keys = [...Object.keys(a), ...Object.keys(b)];
    return keys.some(key => valueChanged(a[key], b[key]));
  }
  return false;
};

export class ChangeDetection<T = any> {
  private previousValue;
  private changed: (a: T, b: T) => boolean;

  constructor(initialValue: T = null, changed: (a: T, b: T) => boolean = valueChanged) {
    this.previousValue = initialValue;
    this.changed = changed;
  }

  check(value: T) {
    if (this.changed(this.previousValue, value)) {
      this.previousValue = value;
      return true;
    }
    return false;
  }
}

export type RenderChildren<P = object, R = any> = (props: P) => R;
export const renderChildrenWithProps = <P = {}>(children: RenderChildren | Array<RenderChildren>, props: P) => {
  const mapChild = child => {
    if (typeof child === "function") return child(props);
    return child;
  };

  if (!children) return null;
  return Array.isArray(children) ? children.map(mapChild) : mapChild(children);
};

export const validateNameProp = name => {
  if (name.indexOf(".") !== -1) throw new Error("Name must not be a path");
};
