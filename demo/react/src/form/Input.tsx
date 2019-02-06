import React, { FunctionComponent, Props } from "react";
import UIFormControl from "@material-ui/core/FormControl";
import UIFormHelperText from "@material-ui/core/FormHelperText";
import UIInput from "@material-ui/core/Input";
import UIInputLabel from "@material-ui/core/InputLabel";
import { Field, IFieldProps } from "../../../../src/react/Field";
import { validators } from "../../../../src/tools/validators";

interface IValidationProps extends IFieldProps {
  required?: boolean;
}
export interface IInputProps extends IFieldProps, IValidationProps {
  label: string;
}
export const Input: FunctionComponent<IInputProps> = props => {
  props = mapPropsToValidation(props);
  const { required } = props;
  return (
    <Field {...props}>
      {fieldProps => (
        <UIFormControl error={!!fieldProps.errors.length}>
          <UIInputLabel htmlFor={props.name}>{props.label}</UIInputLabel>
          <UIInput
            id={props.name}
            name={props.name}
            value={fieldProps.value || ""}
            onChange={e => fieldProps.onChange(e.target.value)}
            onBlur={() => fieldProps.onBlur()}
            required={required}
          />
          {fieldProps.errors.length ? <UIFormHelperText>{fieldProps.errors[0]}</UIFormHelperText> : null}
        </UIFormControl>
      )}
    </Field>
  );
};

const mapPropsToValidation: <T extends IValidationProps>(props: T) => T = props => {
  const { required } = props;
  const onChangeValidation = [];

  if (required) onChangeValidation.push(validators.required("Please enter in a value."));
  if (props.onChangeValidation) onChangeValidation.push(...props.onChangeValidation);

  return {
    ...props,
    onChangeValidation
  };
};
