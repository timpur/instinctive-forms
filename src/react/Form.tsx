import { createElement, Fragment, Component, createContext, Context } from "react";
import { Callback, FormSubscription, TStoreValue } from "../types";
import { StoreContext } from "../core/StoreContext";
import { buildPath } from "../helpers";
import { renderChildrenWithProps, Child, HOC } from "./helpers";
import { getConfig } from "../index";
import { Subscription, connectSubscription } from "../core/Subscription";
import { StoreConnect } from "../core/StoreAdapter";
import { StoreUtils } from "../core/StoreUtils";
import { ERRORS_KEY } from "../constants";

export interface IFormContext {
  name: string;
  parent: IFormContext;
  path: string;
  subscription: FormSubscription;
}

export const FormContext: Context<IFormContext> = createContext({
  name: null,
  parent: null,
  path: null,
  subscription: null
});

export interface IFormProps {
  name: string;
  path?: string;
  onSubmit?: Callback<[React.FormEvent<HTMLFormElement>]>;
}

export class Form extends Component<IFormProps, {}> {
  private subscription: FormSubscription;

  constructor(props: any, context: any) {
    super(props, context);
    this.subscription = new Subscription();
  }

  onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const { onSubmit } = this.props;
    this.subscription.invoke("onSubmit");
    if (onSubmit) onSubmit(event);
  };

  render() {
    const { path, name } = this.props;
    return (
      <FormContext.Provider
        value={{
          name: "form",
          parent: null,
          path: path || name,
          subscription: this.subscription
        }}
      >
        <form name={name} onSubmit={this.onSubmit}>
          {this.props.children}
        </form>
      </FormContext.Provider>
    );
  }
}

export interface IFieldSetProps {
  name: string;
  path?: string;
}

export class FieldSet extends Component<IFieldSetProps, {}> {
  private subscription: FormSubscription;
  private unsubscribe: Callback;

  constructor(props: any, context: any) {
    super(props, context);

    this.subscription = new Subscription();

    const { subscription } = this.context as IFormContext;
    this.unsubscribe = connectSubscription(subscription, this.subscription);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  getPath = () => {
    const { path, name } = this.props;
    const { path: contextPath } = this.context as IFormContext;
    return buildPath(path || contextPath, name);
  };

  render() {
    const path = this.getPath();
    return (
      <FormContext.Provider
        value={{
          name: "fieldset",
          parent: this.context,
          path,
          subscription: this.subscription
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
}

export interface IFormConsumerProps {
  children: Child<IFormChildProps>;
}
export class FormConsumer extends Component<IFormConsumerProps, {}> {
  private unsubscribe: Callback;

  constructor(...args: [any, any]) {
    super(...args);

    const store = getConfig().storeAdapter;
    const { path } = this.context as IFormContext;
    this.unsubscribe = StoreConnect(store, () => this.forceUpdate(), () => store.get(path));
  }

  componentWillUnmount = () => {
    this.unsubscribe();
  };

  render() {
    const { name, parent, path, subscription } = this.context as IFormContext;
    const context = new StoreContext(path);
    const contextState = context.state();
    const contextInError = StoreUtils.findPropFormChildren(contextState, ERRORS_KEY).some(item => !!item.value);
    return (
      <Fragment>
        {renderChildrenWithProps<IFormChildProps>(this.props.children, {
          name,
          parent,
          path,
          subscription,
          context,
          contextState,
          contextInError
        })}
      </Fragment>
    );
  }

  static HOC: HOC<IFormChildProps> = Component => props => (
    <FormConsumer>{formProps => <Component {...formProps} {...props as any} />}</FormConsumer>
  );
  static contextType = FormContext;
}
