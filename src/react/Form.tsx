import { createElement, Fragment, Component, createContext, Context, ReactNode, ComponentType } from "react";
import { Callback, FormSubscription, TStoreValue, Omit } from "../types";
import { StoreContext } from "../core/StoreContext";
import { buildPath, renderChildrenWithProps, RenderChildren, validateNameProp } from "../helpers";
import { getConfig } from "../index";
import { Subscription, connectSubscription } from "../core/Subscription";
import { StoreConnect } from "../core/StoreAdapter";
import { StoreUtils } from "../core/StoreUtils";
import { ERRORS_KEY } from "../constants";

export type HOC<N> = <P extends N, R = Omit<P, keyof N>>(Component: ComponentType<P>) => ComponentType<R>;

export interface IFormContext {
  type: string;
  parent: IFormContext;
  path: string;
  subscription: FormSubscription;
}

export const FormContext: Context<IFormContext> = createContext({
  type: null,
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

  constructor(...args: [any, any]) {
    super(...args);

    if (this.context.type) throw new Error("Form can not be place within a form, use Fieldset.");
    validateNameProp(this.props.name);
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
          type: "form",
          parent: null,
          path: buildPath(path, name),
          subscription: this.subscription
        }}
      >
        <form name={name} onSubmit={this.onSubmit}>
          {this.props.children}
        </form>
      </FormContext.Provider>
    );
  }

  static contextType = FormContext;
}

export interface IFieldsetProps {
  name: string;
  path?: string;
}

export class Fieldset extends Component<IFieldsetProps, {}> {
  private subscription: FormSubscription;
  private unsubscribeFromForm: Callback;

  constructor(...args: [any, any]) {
    super(...args);

    if (!this.context.type) throw new Error("Fieldset must be rendered within a Form.");
    validateNameProp(this.props.name);
    this.subscription = new Subscription();
    const { subscription } = this.context as IFormContext;
    this.unsubscribeFromForm = connectSubscription(subscription, this.subscription);
  }

  componentWillUnmount() {
    this.unsubscribeFromForm();
  }

  getPath = () => {
    const { path, name } = this.props;
    const { path: contextPath } = this.context as IFormContext;
    return buildPath(path || contextPath, name);
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
  children: RenderChildren<IFormChildProps, ReactNode>;
}
export class FormConsumer extends Component<IFormConsumerProps, {}> {
  private unsubscribeFromStore: Callback;

  constructor(...args: [any, any]) {
    super(...args);

    if (!this.context.type) throw new Error("FormConsumer must be rendered within a Form.");
    const { path } = this.context as IFormContext;
    this.connectToStore(path);
  }

  componentWillUnmount() {
    this.unsubscribeFromStore();
  }

  componentWillReceiveProps(nextProps: IFormConsumerProps, nextContext: IFormContext) {
    if (this.context.path !== nextContext.path) {
      const { path } = nextContext;
      this.connectToStore(path);
    }
  }

  connectToStore = path => {
    if (this.unsubscribeFromStore) this.unsubscribeFromStore();
    const store = getConfig().storeAdapter;
    this.unsubscribeFromStore = StoreConnect(store, () => this.forceUpdate(), path);
  };

  render() {
    const { type, parent, path, subscription } = this.context as IFormContext;
    const context = new StoreContext(path);
    const contextState = context.state();
    const contextInError = StoreUtils.findPropFormChildren(contextState, ERRORS_KEY).some(item => !!item.value);
    return (
      <Fragment>
        {renderChildrenWithProps<IFormChildProps>(this.props.children, {
          type,
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
