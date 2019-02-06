import React, { Component } from "react";
import { Form, FormConsumer, IFormChildProps, Fieldset } from "../../../../src/react/Form";
import { Input } from "../form/Input";
import { FormEvents } from "../../../../src/types";

export class Form1 extends Component<IFormChildProps, {}> {
  onForm = (event: FormEvents, formProps: IFormChildProps) => {
    console.log("Form Event:", event);
    if (event.type === "onSubmit") alert(JSON.stringify(formProps.contextState, null, 2));
  };
  render() {
    return (
      <Form
        name="form1"
        onSubmit={e => e.preventDefault()}
        onSubmitValidation={[
          value => {
            console.log(value);
            return "error";
          }
        ]}
      >
        <Fieldset name="fieldset1">
          <FormConsumer onForm={this.onForm}>{null}</FormConsumer>
          <Input name="name" label="Name" required />
          <Input name="gender" label="Gender" />
          <button type="submit">Submit</button>
        </Fieldset>
      </Form>
    );
  }
}
//       <Form onSubmitValidation={()=>true}> <Fieldset onSubmitValidation={()=>true}>
