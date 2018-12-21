import React, { FunctionComponent } from "react";
import UIFormControl from "@material-ui/core/FormControl";
import UIFormHelperText from "@material-ui/core/FormHelperText";
import UIInput from "@material-ui/core/Input";
import UIInputLabel from "@material-ui/core/InputLabel";
import { Field, IFieldProps } from "../../../../src/react/Field";

export interface IInputProps {
  label: string;
}
export const Input: FunctionComponent<IInputProps & IFieldProps<string>> = props => (
  <Field<string> {...props}>
    {fieldProps => (
      <UIFormControl error={!!fieldProps.errors.length}>
        <UIInputLabel htmlFor={props.name}>{props.label}</UIInputLabel>
        <UIInput
          id={props.name}
          name={props.name}
          value={fieldProps.value || ""}
          onChange={e => fieldProps.onChange(e.target.value)}
        />
        {fieldProps.errors.length ? <UIFormHelperText>{fieldProps.errors[0]}</UIFormHelperText> : null}
      </UIFormControl>
    )}
  </Field>
);
