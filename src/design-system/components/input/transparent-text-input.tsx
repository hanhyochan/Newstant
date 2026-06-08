import { TextInput, type TextInputProps } from "./text-input";
import { cn } from "../shared/utils";

export type TransparentTextInputProps = TextInputProps;

export function TransparentTextInput({
  radius = "rounded",
  size = "large",
  variant = "outline",
  wrapperClassName,
  ...props
}: TransparentTextInputProps) {
  return (
    <TextInput
      radius={radius}
      size={size}
      variant={variant}
      wrapperClassName={cn("input_transparent", wrapperClassName)}
      {...props}
    />
  );
}
