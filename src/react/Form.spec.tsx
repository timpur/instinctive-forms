import { createElement, FunctionComponent } from "react";
import { create } from "react-test-renderer";
import { Form, FormContext, Fieldset, FormConsumer, IFormChildProps } from "./Form";
import { setup } from "../index";
import { TestAdapter } from "../../tests/TestAdapter";
import { Subscription } from "../core/Subscription";
import { StoreAdapter } from "../core/StoreAdapter";

const getMockFunctionParam = (fn, call = 1, param = 1) => fn.mock.calls[call - 1][param - 1];

describe("Form", () => {
  it("should render from and children", () => {
    const component = create(
      <Form name="form">
        <p>test</p>
      </Form>
    );
    const tree = component.toJSON();

    expect(tree).toMatchSnapshot();
  });
  it("should not allow form inside a form", () => {
    const render = () =>
      create(
        <Form name="form">
          <Form name="form2">
            <p>test</p>
          </Form>
        </Form>
      );

    expect(render).toThrowError("Form can not be place within a form, use Fieldset.");
  });
  it("should not allow path as a name", () => {
    const createComponent = () =>
      create(
        <Form name="path.form">
          <div>test</div>
        </Form>
      );

    expect(createComponent).toThrowError("Name must not be a path");
  });
  it("should provide form context", () => {
    const cb = jest.fn();
    create(
      <Form name="form">
        <FormContext.Consumer>{props => cb(props)}</FormContext.Consumer>
      </Form>
    );

    expect(cb).toBeCalledTimes(1);
    expect(getMockFunctionParam(cb)).toMatchObject({ type: "form", path: "form", parent: null });
  });
  it("should test path prop", () => {
    const cb = jest.fn();
    create(
      <Form path="path" name="form">
        <FormContext.Consumer>{props => cb(props)}</FormContext.Consumer>
      </Form>
    );

    expect(cb).toBeCalledTimes(1);
    expect(getMockFunctionParam(cb)).toMatchObject({ type: "form", path: "path.form" });
  });
  it("should submit form", () => {
    const onSubmit = jest.fn();
    const component = create(
      <Form name="form" onSubmit={() => onSubmit("userCallback")}>
        <FormContext.Consumer>
          {props => {
            props.subscription.subscribe(onSubmit);
            return null;
          }}
        </FormContext.Consumer>
      </Form>
    );
    const tree = component.toJSON();

    tree.props.onSubmit();
    expect(onSubmit).toHaveBeenCalledWith("onSubmit");
    expect(onSubmit).toHaveBeenCalledWith("userCallback");
  });
});

describe("FieldSet", () => {
  it("should not allow fieldset outside of a form", () => {
    const render = () => create(<Fieldset name="fieldset" />);

    expect(render).toThrowError("Fieldset must be rendered within a Form.");
  });
  it("should not allow path as a name", () => {
    const createComponent = () =>
      create(
        <Form name="form">
          <Fieldset name="path.fieldset">
            <div>test</div>
          </Fieldset>
        </Form>
      );

    expect(createComponent).toThrowError("Name must not be a path");
  });
  it("should render from, fieldset and children", () => {
    const component = create(
      <Form name="form">
        <Fieldset name="fieldset">
          <p>test</p>
        </Fieldset>
      </Form>
    );
    const tree = component.toJSON();

    expect(tree).toMatchSnapshot();
  });
  it("should provide fieldset context", () => {
    const cb = jest.fn();
    create(
      <Form name="form">
        <Fieldset name="fieldset">
          <FormContext.Consumer>{props => cb(props)}</FormContext.Consumer>
        </Fieldset>
      </Form>
    );

    expect(cb).toBeCalledTimes(1);
    expect(getMockFunctionParam(cb)).toMatchObject({
      type: "fieldset",
      path: "form.fieldset",
      parent: { type: "form", path: "form", parent: null }
    });
  });
  it("should test path prop", () => {
    const cb = jest.fn();
    create(
      <Form path="path" name="form">
        <Fieldset name="fieldset">
          <FormContext.Consumer>{props => cb(props)}</FormContext.Consumer>
        </Fieldset>
        <Fieldset path="path" name="fieldset">
          <FormContext.Consumer>{props => cb(props)}</FormContext.Consumer>
        </Fieldset>
      </Form>
    );

    expect(cb).toBeCalledTimes(2);
    expect(getMockFunctionParam(cb)).toMatchObject({ type: "fieldset", path: "path.form.fieldset" });
    expect(getMockFunctionParam(cb, 2)).toMatchObject({ type: "fieldset", path: "path.fieldset" });
  });
  it("should submit fieldset", () => {
    const onSubmit = jest.fn();
    const component = create(
      <Form name="form">
        <Fieldset name="fieldset">
          <FormContext.Consumer>
            {props => {
              props.subscription.subscribe(onSubmit);
              return null;
            }}
          </FormContext.Consumer>
        </Fieldset>
      </Form>
    );
    const tree = component.toJSON();

    tree.props.onSubmit();
    expect(onSubmit).toHaveBeenCalledWith("onSubmit");
  });

  it("should unsubscribe from form on unmount", () => {
    const cb = jest.fn();
    const component = create(
      <Form name="form">
        <Fieldset name="fieldset">
          <FormContext.Consumer>{props => cb(props)}</FormContext.Consumer>
        </Fieldset>
      </Form>
    );
    const sub: Subscription<any> = getMockFunctionParam(cb).parent.subscription;
    expect(sub).toBeInstanceOf(Subscription);
    expect(sub.subscribers).toHaveLength(1);
    component.unmount();
    expect(sub.subscribers).toHaveLength(0);
  });
});

describe("Form Consumer", () => {
  let store: StoreAdapter = null;
  beforeEach(() => {
    const testAdapter = new TestAdapter();
    setup(testAdapter);
    testAdapter.set("form.fieldset.test", "test");
    testAdapter.set("path.form.fieldset.test", "path -> test");
    store = testAdapter;
  });

  it("should not allow form consumer outside of a form", () => {
    const render = () => create(<FormConsumer>{() => null}</FormConsumer>);

    expect(render).toThrowError("FormConsumer must be rendered within a Form.");
  });
  it("should render form, fieldset, consumer and child", () => {
    const component = create(
      <Form name="form">
        <Fieldset name="fieldset">
          <FormConsumer>{() => <p>test</p>}</FormConsumer>
        </Fieldset>
      </Form>
    );
    const tree = component.toJSON();

    expect(tree).toMatchSnapshot();
  });
  it("should have progressive path", () => {
    const cb = jest.fn();
    create(
      <Form name="form">
        <Fieldset name="fieldset1">
          <Fieldset name="fieldset2">
            <FormConsumer>{props => cb(props)}</FormConsumer>
          </Fieldset>
        </Fieldset>
      </Form>
    );

    expect(cb).toBeCalledTimes(1);
    expect(getMockFunctionParam(cb)).toMatchObject({
      type: "fieldset",
      path: "form.fieldset1.fieldset2",
      parent: {
        type: "fieldset",
        path: "form.fieldset1",
        parent: { type: "form", path: "form", parent: null }
      }
    });
  });
  it("should have context state", () => {
    const cb = jest.fn();
    create(
      <Form name="form">
        <Fieldset name="fieldset">
          <FormConsumer>{props => cb(props)}</FormConsumer>
        </Fieldset>
      </Form>
    );

    expect(cb).toBeCalledTimes(1);
    expect(getMockFunctionParam(cb)).toMatchObject({
      contextState: { test: "test" }
    });
  });
  it("should set context state", () => {
    const cb = jest.fn();
    create(
      <Form name="form">
        <Fieldset name="fieldset">
          <FormConsumer>{props => cb(props)}</FormConsumer>
        </Fieldset>
      </Form>
    );

    expect(cb).toBeCalledTimes(1);
    expect(getMockFunctionParam(cb)).toMatchObject({
      contextState: { test: "test" }
    });

    store.set("form.fieldset.test", "changed");

    expect(cb).toBeCalledTimes(2);
    expect(getMockFunctionParam(cb, 2)).toMatchObject({
      contextState: { test: "changed" }
    });
  });
  it("should deal with changing paths", () => {
    const Test: FunctionComponent<{ path?: string }> = props => (
      <Form path={props.path} name="form">
        <Fieldset name="fieldset">
          <FormConsumer>{props => cb(props)}</FormConsumer>
        </Fieldset>
      </Form>
    );
    const cb = jest.fn();
    const component = create(<Test />);

    expect(cb).toBeCalledTimes(1);
    expect(getMockFunctionParam(cb)).toMatchObject({
      path: "form.fieldset",
      contextState: { test: "test" }
    });

    component.update(<Test />);

    expect(cb).toBeCalledTimes(2);
    expect(getMockFunctionParam(cb, 2)).toMatchObject({
      path: "form.fieldset",
      contextState: { test: "test" }
    });

    component.update(<Test path="path" />);

    expect(cb).toBeCalledTimes(3);
    expect(getMockFunctionParam(cb, 3)).toMatchObject({
      path: "path.form.fieldset",
      contextState: { test: "path -> test" }
    });

    store.set("path.form.fieldset.test", "path -> changed");

    expect(cb).toBeCalledTimes(4);
    expect(getMockFunctionParam(cb, 4)).toMatchObject({
      path: "path.form.fieldset",
      contextState: { test: "path -> changed" }
    });
  });
  it("should not render more times than expected", () => {
    const cb = jest.fn();
    create(
      <Form name="form">
        <Fieldset name="fieldset">
          <FormConsumer>{props => cb(props)}</FormConsumer>
        </Fieldset>
      </Form>
    );

    expect(cb).toBeCalledTimes(1);
    expect(getMockFunctionParam(cb)).toMatchObject({
      contextState: { test: "test" }
    });

    store.set("form.fieldset.test", "changed");

    expect(cb).toBeCalledTimes(2);
    expect(getMockFunctionParam(cb, 2)).toMatchObject({
      contextState: { test: "changed" }
    });

    store.set("path.form.fieldset.test", "changed");

    expect(cb).toBeCalledTimes(2);
  });

  it("should unsubscribe from store on unmount", () => {
    const cb = jest.fn();
    const component = create(
      <Form name="form">
        <Fieldset name="fieldset">
          <FormConsumer>{props => cb(props)}</FormConsumer>
        </Fieldset>
      </Form>
    );

    expect(cb).toBeCalledTimes(1);
    expect(getMockFunctionParam(cb)).toMatchObject({
      contextState: { test: "test" }
    });

    store.set("form.fieldset.test", "changed");

    expect(cb).toBeCalledTimes(2);
    expect(getMockFunctionParam(cb, 2)).toMatchObject({
      contextState: { test: "changed" }
    });

    component.unmount();

    store.set("form.fieldset.test", "not seen");
    expect(cb).toBeCalledTimes(2);
  });
  it("should have form in error", () => {
    const cb = jest.fn();
    create(
      <Form name="form">
        <Fieldset name="fieldset">
          <FormConsumer>{props => cb(props)}</FormConsumer>
        </Fieldset>
      </Form>
    );

    expect(cb).toBeCalledTimes(1);
    expect(getMockFunctionParam(cb)).toMatchObject({
      contextInError: false
    });

    store.set("form.fieldset.__errors__.test", ["error"]);

    expect(cb).toBeCalledTimes(2);
    expect(getMockFunctionParam(cb, 2)).toMatchObject({
      contextInError: true
    });
  });
  it("should pass context via HOC", () => {
    const cb = jest.fn();
    const Test: FunctionComponent<IFormChildProps & { testProp: string }> = props => {
      cb(props);
      return <div>test component: {props.testProp}</div>;
    };
    const ConnectedTest = FormConsumer.HOC(Test);
    const component = create(
      <Form name="form">
        <Fieldset name="fieldset">
          <ConnectedTest testProp="bla" />
        </Fieldset>
      </Form>
    );
    const tree = component.toJSON();

    expect(tree).toMatchSnapshot();
    expect(cb).toBeCalledTimes(1);
    expect(getMockFunctionParam(cb)).toMatchObject({
      path: "form.fieldset",
      contextState: { test: "test" }
    });
  });
});
