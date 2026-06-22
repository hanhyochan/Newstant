import { TextInput, type TextInputProps } from "./text-input";
import { cn } from "../shared/utils";

export type TransparentTextInputProps = TextInputProps;

export function TransparentTextInput({
  wrapperClassName,
  ...props
}: TransparentTextInputProps) {
  return (
    <TextInput
      wrapperClassName={cn("input_transparent", wrapperClassName)}
      {...props}
    />
  );
}
