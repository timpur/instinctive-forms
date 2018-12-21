import { createElement, FunctionComponent } from "react";
import { create } from "react-test-renderer";
import { Form, Fieldset } from "./Form";
import { Field } from "./Field";
import { StoreAdapter } from "../core/StoreAdapter";
import { TestAdapter } from "../../tests/TestAdapter";
import { setup } from "../index";

const getMockFunctionParam = (fn, call = 1, param = 1) => fn.mock.calls[call - 1][param - 1];

let store: StoreAdapter = null;
beforeEach(() => {
  const testAdapter = new TestAdapter();
  setup(testAdapter);
  testAdapter.set("form.fieldset.field", "field value");
  testAdapter.set("path.form.fieldset.field", "path => field value");
  testAdapter.set("path.field", "direct path => field value");
  store = testAdapter;
});

it("should not allow field outside of form ", () => {
  const createComponent = () => create(<Field name="path.field">{props => <div>{props.path}</div>}</Field>);

  expect(createComponent).toThrowError("Field must be rendered within a Form.");
});
it("should not allow path as a name", () => {
  const createComponent = () =>
    create(
      <Form name="form">
        <Fieldset name="fieldset">
          <Field name="path.field">{props => <div>{props.path}</div>}</Field>
        </Fieldset>
      </Form>
    );

  expect(createComponent).toThrowError("Name must not be a path");
});
it("should deal with changing paths", () => {
  const Test: FunctionComponent<{ formPath?: string; path?: string }> = props => (
    <Form path={props.formPath} name="form">
      <Fieldset name="fieldset">
        <Field path={props.path} name="field">
          {props => cb(props)}
        </Field>
      </Fieldset>
    </Form>
  );
  const cb = jest.fn();
  const component = create(<Test />);

  expect(cb).toBeCalledTimes(1);
  expect(getMockFunctionParam(cb)).toMatchObject({
    path: "form.fieldset.field",
    value: "field value"
  });

  component.update(<Test />);

  expect(cb).toBeCalledTimes(2);
  expect(getMockFunctionParam(cb, 2)).toMatchObject({
    path: "form.fieldset.field",
    value: "field value"
  });

  component.update(<Test formPath="path" />);

  expect(cb).toBeCalledTimes(3);
  expect(getMockFunctionParam(cb, 3)).toMatchObject({
    path: "path.form.fieldset.field",
    value: "path => field value"
  });

  store.set("path.form.fieldset.field", "path => field value changed");

  expect(cb).toBeCalledTimes(4);
  expect(getMockFunctionParam(cb, 4)).toMatchObject({
    path: "path.form.fieldset.field",
    value: "path => field value changed"
  });

  component.update(<Test path="path" />);

  expect(cb).toBeCalledTimes(5);
  expect(getMockFunctionParam(cb, 5)).toMatchObject({
    path: "path.field",
    value: "direct path => field value"
  });
});
it("should run validation on change", () => {
  const cb = jest.fn();
  create(
    <Form name="form">
      <Fieldset name="fieldset">
        <Field name="field" onChangeValidation={[() => "error"]}>
          {props => cb(props)}
        </Field>
      </Fieldset>
    </Form>
  );

  getMockFunctionParam(cb).onChange("changed value");

  expect(store.get("form.fieldset.field")).toEqual("changed value");
  expect(cb).toHaveBeenCalledTimes(2);
  expect(getMockFunctionParam(cb, 2)).toMatchObject({
    errors: ["error"]
  });
  expect(store.get("form.fieldset.__errors__.field")).toEqual(["error"]);
});
it("should run validation on blur", () => {
  const cb = jest.fn();
  create(
    <Form name="form">
      <Fieldset name="fieldset">
        <Field name="field" onBlurValidation={[() => "error"]}>
          {props => cb(props)}
        </Field>
      </Fieldset>
    </Form>
  );

  getMockFunctionParam(cb).onBlur();

  expect(cb).toHaveBeenCalledTimes(2);
  expect(getMockFunctionParam(cb, 2)).toMatchObject({
    errors: ["error"]
  });
  expect(store.get("form.fieldset.__errors__.field")).toEqual(["error"]);
});
it("should run validation on form submit", () => {
  const cb = jest.fn();
  const onSubmit = jest.fn();
  const component = create(
    <Form name="form" onSubmit={onSubmit}>
      <Fieldset name="fieldset">
        <Field name="field" onSubmitValidation={[() => "error"]}>
          {props => cb(props)}
        </Field>
      </Fieldset>
    </Form>
  );
  const tree = component.toJSON();

  tree.props.onSubmit();
  expect(onSubmit).toHaveBeenCalled();
  expect(getMockFunctionParam(cb, 2)).toMatchObject({
    errors: ["error"]
  });
  expect(store.get("form.fieldset.__errors__.field")).toEqual(["error"]);
});
it("should not render more times than expected", () => {
  const cb = jest.fn();
  create(
    <Form name="form">
      <Fieldset name="fieldset">
        <Field name="field">{props => cb(props)}</Field>
      </Fieldset>
    </Form>
  );

  expect(cb).toHaveBeenCalledTimes(1);

  store.set("form.fieldset.field", "changed value");

  expect(cb).toHaveBeenCalledTimes(2);
  expect(getMockFunctionParam(cb, 2)).toMatchObject({
    value: "changed value",
    errors: []
  });

  store.set("form.fieldset.__errors__.field", ["error"]);

  expect(cb).toHaveBeenCalledTimes(3);
  expect(getMockFunctionParam(cb, 3)).toMatchObject({
    value: "changed value",
    errors: ["error"]
  });

  store.set("form.fieldset.field2", "changed value");
  store.set("form.fieldset.__errors__.field2", ["error"]);

  expect(cb).toHaveBeenCalledTimes(3);
});

// TODO: test disable change state and validation errors
// TODO: filters
