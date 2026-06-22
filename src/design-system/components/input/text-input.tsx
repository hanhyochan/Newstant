import { useId, type InputHTMLAttributes } from "react";

import { cn } from "../shared/utils";

type TextInputState = "default" | "complete" | "error" | "view";

export type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  state?: TextInputState;
  wrapperClassName?: string;
};

export function TextInput({
  className,
  disabled,
  id,
  name,
  readOnly,
  state = "default",
  wrapperClassName,
  ...props
}: TextInputProps) {
  const generatedId = useId();
  const isView = state === "view" || readOnly;
  const fieldId = id ?? generatedId;

  return (
    <label
      className={cn(
        "text_input",
        "text_input_large",
        "text_input_outline",
        "text_input_rounded",
        state === "complete" && "text_input_complete",
        state === "error" && "text_input_error",
        disabled && "text_input_disabled",
        isView && "text_input_view",
        wrapperClassName,
      )}
    >
      <input
        className={className}
        disabled={disabled}
        id={fieldId}
        name={name}
        readOnly={isView}
        {...props}
      />
    </label>
  );
}
