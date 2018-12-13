import { createElement, Component, Fragment } from "react";
import { FormContext, IFormContext } from "./Form";
import { Callback, TPrimitive, FormValidationType, FormValidations, FormErrors, FormFilters } from "../types";
import { getConfig } from "../index";
import { StoreConnect } from "../core/StoreAdapter";
import { buildPath, runValidation, runFilters, arrayChanged } from "../helpers";
import { renderChildrenWithProps, Child } from "./helpers";
import { ERRORS_KEY } from "../constants";

export interface IFieldChildProps {
  path: string;
  errorPath: string;
  value: TPrimitive;
  errors: FormErrors;
  onChange: Callback<[TPrimitive]>;
}

export interface IFieldProps {
  name: string;
  path?: string;
  onChangeValidation?: FormValidations;
  onBlurValidation?: FormValidations;
  onSubmitValidation?: FormValidations;
  filters?: FormFilters;
  disabled?: boolean;
  children: Child<IFieldChildProps>;
}

export class Field extends Component<IFieldProps, {}> {
  private unsubscribe: Callback[] = [];

  constructor(...args: [any, any]) {
    super(...args);

    if (this.props.name.indexOf(".") !== -1) throw new Error("Name must be of valid format");

    const store = getConfig().storeAdapter;
    const { subscription } = this.context as IFormContext;

    this.unsubscribe.push(StoreConnect(store, () => this.forceUpdate(), () => store.get(this.getPath())));
    this.unsubscribe.push(subscription.subscribe(this.onSubscriptionEvent));
  }

  componentWillUnmount = () => {
    this.unsubscribe.forEach(cb => cb());
  };

  componentWillReceiveProps(nextProps: IFieldProps) {
    if (this.props.disabled !== nextProps.disabled) {
      this.setValidationErrorsIfChanged();
    }
  }

  getPath = () => {
    const { path, name } = this.props;
    const { path: contextPath } = this.context as IFormContext;
    return buildPath(path || contextPath, name);
  };
  getErrorPath = () => {
    const { path, name } = this.props;
    const { path: contextPath } = this.context as IFormContext;
    return buildPath(path || contextPath, ERRORS_KEY, name);
  };

  onChange = (_value: TPrimitive) => {
    const value = runFilters(this.props.filters, _value);
    const errors = this.getValidationErrors("onChange", value);

    const store = getConfig().storeAdapter;
    store.setPaths([{ path: this.getPath(), value: value }, { path: this.getErrorPath(), value: errors }]);
  };

  onSubscriptionEvent = (event: FormValidationType) => {
    this.setValidationErrorsIfChanged(event);
  };

  setValidationErrorsIfChanged = (type: FormValidationType = "onChange") => {
    const store = getConfig().storeAdapter;
    const value = store.get(this.getPath());
    const currentErrors = store.get(this.getErrorPath()) as FormErrors;
    const newErrors = this.getValidationErrors(type, value);

    if (arrayChanged(currentErrors, newErrors)) {
      store.set(this.getErrorPath(), newErrors);
    }
  };

  getValidationErrors = (type: FormValidationType, value: TPrimitive) => {
    const { disabled, onSubmitValidation, onBlurValidation, onChangeValidation } = this.props;
    const errors: FormErrors = [];
    if (disabled) return errors;

    switch (type) {
      case "onSubmit":
        errors.unshift(...runValidation(onSubmitValidation, value));
      case "onBlur":
        errors.unshift(...runValidation(onBlurValidation, value));
      case "onChange":
        errors.unshift(...runValidation(onChangeValidation, value));
    }
    return errors;
  };

  render() {
    const store = getConfig().storeAdapter;
    const path = this.getPath();
    const errorPath = this.getErrorPath();
    const value = store.get(path);
    const errors = store.get(errorPath, []) as FormErrors;
    return (
      <Fragment>
        {renderChildrenWithProps<IFieldChildProps>(this.props.children, {
          path,
          errorPath,
          value,
          errors,
          onChange: this.onChange
        })}
      </Fragment>
    );
  }

  static contextType = FormContext;
}
