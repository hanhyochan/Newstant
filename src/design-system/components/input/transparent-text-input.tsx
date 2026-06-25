import { TextInput, type TextInputProps } from "./text-input";

export type TransparentTextInputProps = TextInputProps;

export function TransparentTextInput({
  wrapperClassName,
  ...props
}: TransparentTextInputProps) {
  return (
    <TextInput
      variant="dark"
      wrapperClassName={wrapperClassName}
      {...props}
    />
  );
}
