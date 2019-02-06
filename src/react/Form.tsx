import { createElement, Fragment, Component, createContext, Context, ReactNode, ComponentType } from "react";
import {
  Callback,
  FormSubscription,
  TStoreValue,
  Omit,
  FormSubscriber,
  FormEvents,
  TPrimitive,
  Selector,
  FormValidationEventTypes
} from "../types";
import { StoreContext } from "../core/StoreContext";
import { buildPath, renderChildrenWithProps, RenderChildren, validateNameProp } from "../helpers";
import { getConfig } from "../index";
import { Subscription, connectSubscription } from "../core/Subscription";
import { StoreConnect } from "../core/StoreAdapter";
import { StoreUtils } from "../core/StoreUtils";
import {
  IFormValidationProps,
  IFormValidation,
  getValidationErrors,
  setValidationErrorsIfChanged,
  filterFormValidationEvents,
  ERRORS_KEY
} from "../core/Form";

export type HOC<N> = <P extends N, R = Omit<P, keyof N>>(Component: ComponentType<P>) => ComponentType<R>;

export interface IFormContext {
  type: string;
  parent: IFormContext;
  path: string;
  events: FormSubscription;
}
export const FormContext: Context<IFormContext> = createContext({
  type: null,
  parent: null,
  path: null,
  events: null
});

type FormProps = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
export interface IFormProps extends IFormValidationProps, FormProps {
  name: string;
  path?: string;
  onSubmit?: Selector<boolean | void, [React.FormEvent<HTMLFormElement>]>;
  submitOnlyWhenValid?: boolean;
}

export class Form extends Component<IFormProps, {}> implements IFormValidation {
  private formEvents: FormSubscription;
  private unsubscribeFromEvents: Callback;

  constructor(...args: [any, any]) {
    super(...args);

    if (this.context.type) throw new Error("Form can not be place within a form, use Fieldset.");
    validateNameProp(this.props.name);
    this.formEvents = new Subscription();
    this.unsubscribeFromEvents = this.formEvents.subscribe(
      filterFormValidationEvents(e => this.setValidationErrorsIfChanged(e.type))
    );
  }

  componentWillUnmount() {
    this.unsubscribeFromEvents();
  }

  getPath = () => buildPath(this.props.path, this.props.name);

  getErrorPath = () => buildPath(ERRORS_KEY, this.getPath());

  setValidationErrorsIfChanged = (eventType: FormValidationEventTypes) =>
    setValidationErrorsIfChanged(this, this.props, eventType);

  getValidationErrors = (eventType: FormValidationEventTypes, value: TPrimitive) =>
    getValidationErrors(this.props, eventType, value);

  onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const { onSubmit } = this.props;

    this.formEvents.invoke({ type: "runSubmitValidation", sender: this });

    const store = getConfig().storeAdapter;
    const inError = isFormStateInError(store.get(this.getPath()));
    if (this.props.submitOnlyWhenValid && inError) return event.preventDefault();

    const formSubmitted = onSubmit && onSubmit(event) === false ? false : true;
    if (formSubmitted) {
      this.formEvents.invoke({ type: "onSubmit", sender: this });
    }
  };

  render() {
    const { path, name, onSubmitValidation, ...formProps } = this.props;
    return (
      <FormContext.Provider
        value={{
          type: "form",
          parent: null,
          path: this.getPath(),
          events: this.formEvents
        }}
      >
        <form {...formProps} name={name} onSubmit={this.onSubmit}>
          {this.props.children}
        </form>
      </FormContext.Provider>
    );
  }

  static contextType = FormContext;
}

export interface IFieldsetProps extends IFormValidationProps {
  name: string;
  path?: string;
}

export class Fieldset extends Component<IFieldsetProps, {}> implements IFormValidation {
  private fieldSetEvents: FormSubscription;
  private unsubscribeFromEvents: Callback;
  private unsubscribeFromConnectedEvents: Callback;

  constructor(...args: [any, any]) {
    super(...args);

    if (!this.context.type) throw new Error("Fieldset must be rendered within a Form.");
    validateNameProp(this.props.name);
    this.fieldSetEvents = new Subscription();
    this.unsubscribeFromEvents = this.fieldSetEvents.subscribe(
      filterFormValidationEvents(e => this.setValidationErrorsIfChanged(e.type))
    );
    const { events: formEvents } = this.context as IFormContext;
    this.joinFieldsetEventsToFormEvents(formEvents);
  }

  componentWillReceiveProps(nextProps: IFieldsetProps, nextContext: IFormContext) {
    if (this.context.events !== nextContext.events) this.joinFieldsetEventsToFormEvents(nextContext.events);
  }

  componentWillUnmount() {
    this.unsubscribeFromEvents();
    this.unsubscribeFromConnectedEvents();
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

  setValidationErrorsIfChanged = (eventType: FormValidationEventTypes) =>
    setValidationErrorsIfChanged(this, this.props, eventType);

  getValidationErrors = (eventType: FormValidationEventTypes, value: TPrimitive) =>
    getValidationErrors(this.props, eventType, value);

  joinFieldsetEventsToFormEvents = (formEvents: FormSubscription) => {
    if (this.unsubscribeFromConnectedEvents) this.unsubscribeFromConnectedEvents();
    this.unsubscribeFromConnectedEvents = connectSubscription(formEvents, this.fieldSetEvents);
  };

  render() {
    const path = this.getPath();
    const { name } = this.props;
    return (
      <FormContext.Provider
        value={{
          type: "fieldset",
          parent: this.context,
          path,
          events: this.fieldSetEvents
        }}
      >
        <fieldset name={name}>{this.props.children}</fieldset>
      </FormContext.Provider>
    );
  }

  static contextType = FormContext;
}

export interface IFormChildProps extends IFormContext {
  context: StoreContext;
  contextState: TStoreValue;
  contextInError: boolean;
  // TODO: list of in error fields
}

export interface IFormConsumerProps {
  onForm?: Callback<[FormEvents, IFormChildProps]>;
  children: RenderChildren<IFormChildProps, ReactNode>;
}
export class FormConsumer extends Component<IFormConsumerProps, {}> {
  private unsubscribeFromEvents: Callback;
  private unsubscribeFromStore: Callback;

  constructor(...args: [any, any]) {
    super(...args);

    if (!this.context.type) throw new Error("FormConsumer must be rendered within a Form.");
    const { path, events } = this.context as IFormContext;
    this.connectToStore(path);
    this.connectToFormEvents(events);
  }

  componentWillUnmount() {
    this.unsubscribeFromStore();
  }

  componentWillReceiveProps(nextProps: IFormConsumerProps, nextContext: IFormContext) {
    if (this.context.path !== nextContext.path) {
      const { path } = nextContext;
      this.connectToStore(path);
    }
    if (this.context.events !== nextContext.events) {
      this.connectToFormEvents(nextContext.events);
    }
  }

  connectToStore = path => {
    if (this.unsubscribeFromStore) this.unsubscribeFromStore();
    const store = getConfig().storeAdapter;
    this.unsubscribeFromStore = StoreConnect(store, () => this.forceUpdate(), path);
  };

  connectToFormEvents = (formEvents: FormSubscription) => {
    if (this.unsubscribeFromEvents) this.unsubscribeFromEvents();
    this.unsubscribeFromEvents = formEvents.subscribe(this.onFormEvent);
  };

  getChildProps: () => IFormChildProps = () => {
    const { type, parent, path, events } = this.context as IFormContext;
    const context = new StoreContext(path);
    const contextState = context.state();
    const contextInError = isFormStateInError(contextState);
    return {
      type,
      parent,
      path,
      events,
      context,
      contextState,
      contextInError
    };
  };

  onFormEvent: FormSubscriber = event => {
    const { onForm } = this.props;
    const childProps = this.getChildProps();

    if (onForm) onForm(event, childProps);
  };

  render() {
    const childProps = this.getChildProps();
    return <Fragment>{renderChildrenWithProps<IFormChildProps>(this.props.children, childProps)}</Fragment>;
  }

  static HOC: HOC<IFormChildProps> = Component => props => (
    <FormConsumer>{formProps => <Component {...formProps} {...props as any} />}</FormConsumer>
  );
  static contextType = FormContext;
}

const isFormStateInError = (state: TStoreValue) =>
  StoreUtils.findPropInStateRecursive(state, ERRORS_KEY).some(item => !!item.value);
