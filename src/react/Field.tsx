import { createElement, Component, Fragment, ReactNode } from "react";
import { FormContext, IFormContext } from "./Form";
import { Callback, TPrimitive, FormValidationType, FormValidations, FormErrors, FormFilters } from "../types";
import { getConfig } from "../index";
import { StoreConnect } from "../core/StoreAdapter";
import {
  buildPath,
  runValidation,
  runFilters,
  arrayChanged,
  RenderChildren,
  renderChildrenWithProps,
  validateNameProp
} from "../helpers";
import { ERRORS_KEY } from "../constants";

export interface IFieldChildProps {
  path: string;
  errorPath: string;
  value: TPrimitive;
  errors: FormErrors;
  onChange: Callback<[TPrimitive]>;
  onBlur: Callback;
}

export interface IFieldProps {
  name: string;
  path?: string;
  onChangeValidation?: FormValidations;
  onBlurValidation?: FormValidations;
  onSubmitValidation?: FormValidations;
  filters?: FormFilters;
  disabled?: boolean;
  children?: RenderChildren<IFieldChildProps, ReactNode>;
}

export class Field extends Component<IFieldProps, {}> {
  private unsubscribeFromStore: Callback;
  private unsubscribeFromForm: Callback;

  constructor(...args: [any, any]) {
    super(...args);

    if (!this.context.type) throw new Error("Field must be rendered within a Form.");
    validateNameProp(this.props.name);
    this.connectToStore();
    const { subscription } = this.context as IFormContext;
    this.unsubscribeFromForm = subscription.subscribe(event => this.setValidationErrorsIfChanged(event));
  }

  componentWillReceiveProps(nextProps: IFieldProps, nextContext: IFormContext) {
    if (this.getPath() !== this.getPath(nextProps, nextContext)) {
      this.connectToStore(nextProps, nextContext);
    }
    if (this.props.disabled !== nextProps.disabled) {
      this.setValidationErrorsIfChanged();
    }
  }

  componentWillUnmount = () => {
    this.unsubscribeFromStore();
    this.unsubscribeFromForm();
  };

  connectToStore = (props: IFieldProps = this.props, context: IFormContext = this.context) => {
    if (this.unsubscribeFromStore) this.unsubscribeFromStore();
    const store = getConfig().storeAdapter;
    this.unsubscribeFromStore = StoreConnect(
      store,
      () => this.forceUpdate(),
      this.getPath(props, context),
      this.getErrorPath(props, context)
    );
  };

  getPath = (props: IFieldProps = this.props, context: IFormContext = this.context) => {
    const { path, name } = props;
    const { path: contextPath } = context;
    return buildPath(path || contextPath, name);
  };

  getErrorPath = (props: IFieldProps = this.props, context: IFormContext = this.context) => {
    const { path, name } = props;
    const { path: contextPath } = context;
    return buildPath(path || contextPath, ERRORS_KEY, name);
  };

  onChange = (_value: TPrimitive) => {
    const value = runFilters(this.props.filters, _value);
    const errors = this.getValidationErrors("onChange", value);

    const store = getConfig().storeAdapter;
    store.setPaths([{ path: this.getPath(), value: value }, { path: this.getErrorPath(), value: errors }]);
  };

  onBlur = () => {
    this.setValidationErrorsIfChanged("onBlur");
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
          onChange: this.onChange,
          onBlur: this.onBlur
        })}
      </Fragment>
    );
  }

  static contextType = FormContext;
}
