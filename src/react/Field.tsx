import { createElement, Component, Fragment, ReactNode } from "react";
import { FormContext, IFormContext } from "./Form";
import { Callback, TPrimitive, FormErrors, FormFilters, FormValidationEventTypes } from "../types";
import { getConfig } from "../index";
import { StoreConnect } from "../core/StoreAdapter";
import {
  buildPath,
  runValidation,
  runFilters,
  arrayChanged,
  RenderChildren,
  renderChildrenWithProps,
  validateNameProp,
  isEmptyValue
} from "../helpers";
import {
  ERRORS_KEY,
  IFormValidation,
  IFormValidationProps,
  setValidationErrorsIfChanged,
  getValidationErrors,
  filterFormValidationEvents
} from "../core/Form";

export interface IFieldChildProps {
  path: string;
  errorPath: string;
  value: TPrimitive;
  errors: FormErrors;
  onChange: Callback<[TPrimitive]>;
  onBlur: Callback;
}

export interface IFieldProps extends IFormValidationProps {
  name: string;
  path?: string;
  filters?: FormFilters;
  disabled?: boolean;
  children?: RenderChildren<IFieldChildProps, ReactNode>;
}

export class Field extends Component<IFieldProps, {}> implements IFormValidation {
  private unsubscribeFromStore: Callback;
  private unsubscribeFromForm: Callback;

  constructor(...args: [any, any]) {
    super(...args);

    if (!this.context.type) throw new Error("Field must be rendered within a Form.");
    validateNameProp(this.props.name);
    this.connectToStore();
    const { events } = this.context as IFormContext;
    this.unsubscribeFromForm = events.subscribe(
      filterFormValidationEvents(e => this.setValidationErrorsIfChanged(e.type))
    );
  }

  componentWillReceiveProps(nextProps: IFieldProps, nextContext: IFormContext) {
    if (this.getPath() !== this.getPath(nextProps, nextContext)) {
      this.connectToStore(nextProps, nextContext);
    }
    if (this.props.disabled !== nextProps.disabled) {
      this.setValidationErrorsIfChanged("runChangeValidation");
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
    _value = isEmptyValue(_value) ? null : _value;
    const value = runFilters(this.props.filters, _value);
    const errors = this.getValidationErrors("runChangeValidation", value);

    const store = getConfig().storeAdapter;
    store.setPaths([{ path: this.getPath(), value: value }, { path: this.getErrorPath(), value: errors }]);

    const { events } = this.context as IFormContext;
    events.invoke({ type: "onChange", sender: this, fromValue: "", toValue: value, fromErrors: [], toErrors: errors });
  };

  onBlur = () => {
    this.setValidationErrorsIfChanged("runBlurValidation");

    const { events } = this.context as IFormContext;
    events.invoke({ type: "onBlur", sender: this, fromErrors: [], toErrors: [] });
  };

  setValidationErrorsIfChanged = (eventType: FormValidationEventTypes) =>
    setValidationErrorsIfChanged(this, this.props, eventType);

  getValidationErrors = (eventType: FormValidationEventTypes, value: TPrimitive) =>
    getValidationErrors(this.props, eventType, value);

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
