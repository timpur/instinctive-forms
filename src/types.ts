import { Subscription, Subscriber } from "./core/Subscription";

// Base Types
export type Key = string | number | symbol;
export type Diff<T extends Key, U extends Key> = ({ [P in T]: P } & { [P in U]: never } & { [x: string]: never })[T];
export type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>;

export type TPrimitive = object | [] | string | number | boolean | null | undefined;
export type TStoreValue = TPrimitive;

export type FormOnEventTypes = "onChange" | "onBlur" | "onSubmit" | "onSubmitAbort";
export type FormValidationEventTypes = "runChangeValidation" | "runBlurValidation" | "runSubmitValidation";
export type FormEventTypes = FormOnEventTypes | FormValidationEventTypes;
export type FormEvent<E extends { type: string; sender: any }> = E;
export type FormRunChangeValidationEvent<S = any> = FormEvent<{ type: "runChangeValidation"; sender: S }>;
export type FormOnChangeEvent<S = any> = FormEvent<{
  type: "onChange";
  sender: S;
  fromValue: TStoreValue;
  toValue: TStoreValue;
  fromErrors: FormErrors;
  toErrors: FormErrors;
}>;
export type FormRunBlurValidationEvent<S = any> = FormEvent<{ type: "runBlurValidation"; sender: S }>;
export type FormOnBlurEvent<S = any> = FormEvent<{
  type: "onBlur";
  sender: S;
  fromErrors: FormErrors;
  toErrors: FormErrors;
}>;
export type FormRunSubmitValidationEvent<S = any> = FormEvent<{ type: "runSubmitValidation"; sender: S }>;
export type FormOnSubmitEvent<S = any> = FormEvent<{ type: "onSubmit"; sender: S }>;
export type FormOnSubmitAbortEvent<S = any> = FormEvent<{
  type: "onSubmitAbort";
  sender: S;
  reason: "user" | "validation";
}>;
export type FormEvents =
  | FormRunChangeValidationEvent
  | FormOnChangeEvent
  | FormRunBlurValidationEvent
  | FormOnBlurEvent
  | FormRunSubmitValidationEvent
  | FormOnSubmitEvent
  | FormOnSubmitAbortEvent;
export type FormSubscription = Subscription<[FormEvents]>;
export type FormSubscriber = Subscriber<[FormEvents]>;
export type FormError = string | null;
export type FormErrors = Array<FormError>;
export type FormValidation = (value: TPrimitive) => FormError;
export type FormValidations = Array<FormValidation>;
export type FormFilter = (value: TPrimitive) => TPrimitive;
export type FormFilters = Array<FormFilter>;

export type Callback<TArgs extends any[] = []> = (...args: TArgs) => void;
export type Selector<TReturn = any, TArgs extends any[] = []> = (...args: TArgs) => TReturn;
