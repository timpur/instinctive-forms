import { Subscription, Subscriber } from "./core/Subscription";

export type TPrimitive = object | [] | string | number | boolean | null | undefined;
export type TStoreValue = TPrimitive;

export type FormValidationType = "onChange" | "onBlur" | "onSubmit";
export type FormSubscription = Subscription<[FormValidationType]>;
export type FormSubscriber = Subscriber<[FormValidationType]>;
export type FormError = string | null;
export type FormErrors = Array<FormError>;
export type FormValidation = (value: TPrimitive) => FormError;
export type FormValidations = Array<FormValidation>;
export type FormFilter = (value: TPrimitive) => TPrimitive;
export type FormFilters = Array<FormFilter>;

export type Callback<TArgs extends any[] = []> = (...args: TArgs) => void;
export type Selector<TReturn = any, TArgs extends any[] = []> = (...args: TArgs) => TReturn;

// Base Types
export type Key = string | number | symbol;
export type Diff<T extends Key, U extends Key> = ({ [P in T]: P } & { [P in U]: never } & { [x: string]: never })[T];
export type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>;
