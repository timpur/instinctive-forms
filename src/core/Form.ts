import {
  Callback,
  FormEvents,
  FormValidations,
  TPrimitive,
  FormErrors,
  FormValidationEventTypes,
  FormEvent
} from "../types";
import { runValidation, arrayChanged } from "../helpers";
import { getConfig } from "../index";

export const ERRORS_KEY = "__errors__";

export interface IFormValidationProps {
  disabled?: boolean;
  onChangeValidation?: FormValidations;
  onBlurValidation?: FormValidations;
  onSubmitValidation?: FormValidations;
}

export interface IFormValidation {
  getPath(): string;
  getErrorPath(): string;
  setValidationErrorsIfChanged(eventType: FormValidationEventTypes): void;
  getValidationErrors(eventType: FormValidationEventTypes, value: TPrimitive): FormErrors;
}

export const setValidationErrorsIfChanged = (
  component: IFormValidation,
  props: IFormValidationProps,
  eventType: FormValidationEventTypes
) => {
  const store = getConfig().storeAdapter;
  const path = component.getPath();
  const errorPath = component.getErrorPath();
  const value = store.get(path);
  const currentErrors = store.get(errorPath, []) as FormErrors;
  const newErrors = getValidationErrors(props, eventType, value);

  if (arrayChanged(currentErrors, newErrors)) {
    store.set(errorPath, newErrors);
  }
};

export const getValidationErrors = (
  props: IFormValidationProps,
  eventType: FormValidationEventTypes,
  value: TPrimitive
) => {
  const { disabled, onSubmitValidation, onBlurValidation, onChangeValidation } = props;
  const errors = [];
  if (disabled) return errors;
  switch (eventType) {
    case "runSubmitValidation":
      errors.unshift(...runValidation(onSubmitValidation, value));
    case "runBlurValidation":
      errors.unshift(...runValidation(onBlurValidation, value));
    case "runChangeValidation":
      errors.unshift(...runValidation(onChangeValidation, value));
  }
  return errors;
};

export const filterFormEvents: <TEvent extends { type: TEventType }, TEventType>(
  cb: Callback<[TEvent]>,
  events: TEventType[]
) => (event: FormEvents) => void = (cb, events) => event => {
  if (events.indexOf(event.type as any) !== -1) {
    return cb(event as any);
  }
};

export const validationEvents: FormValidationEventTypes[] = [
  "runChangeValidation",
  "runBlurValidation",
  "runSubmitValidation"
];
export const filterFormValidationEvents: (
  cb: Callback<[FormEvent<{ type: FormValidationEventTypes; sender: any }>]>
) => (event: FormEvents) => void = cb => {
  return filterFormEvents(cb, validationEvents);
};
