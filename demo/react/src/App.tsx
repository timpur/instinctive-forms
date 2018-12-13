import React, { FunctionComponent } from "react";
import { Provider } from "react-redux";

import { Form, FieldSet, FormConsumer } from "../../../src/react/Form";
import { Field } from "../../../src/react/Field";
import { store } from "./store";

export const App: FunctionComponent = () => {
  return (
    <Provider store={store}>
      <div>
        <Form name="form" onSubmit={e => e.preventDefault()}>
          <FieldSet name="group">
            <Field
              name="field"
              onChangeValidation={[(v: string) => v && v.length >= 3 && "error"]}
              filters={[(v: string) => v.substring(0, 4)]}
            >
              {props => (
                <div>
                  <input
                    name="field"
                    value={(props.value as string) || ""}
                    onChange={e => props.onChange(e.target.value)}
                  />
                  {props.errors.length && <p>Error: {props.errors[0]}</p>}
                  <p>Field: {props.value}</p>
                </div>
              )}
            </Field>
            <DebugFormConsumer />
          </FieldSet>
          <DebugFormConsumer />
          <button type="submit">Submit</button>
        </Form>
      </div>
    </Provider>
  );
};

const DebugFormConsumer = () => (
  <FormConsumer>
    {props => (
      <div>
        <p>Name: {props.name}</p>
        <p>Path: {props.path}</p>
        {props.parent && (
          <div>
            <p>Parent Name: {props.parent.name}</p>
            <p>Parent Path: {props.parent.path}</p>
          </div>
        )}
        <p>live: {JSON.stringify(props.context.state())}</p>
        <p>state: {JSON.stringify(props.contextState)}</p>
        <p>inError: {props.contextInError ? "Yes" : "No"}</p>
      </div>
    )}
  </FormConsumer>
);
