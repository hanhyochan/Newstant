import { useId, type InputHTMLAttributes } from "react";

import { cn } from "../shared/utils";

type TextInputState = "default" | "complete" | "error" | "view";
export type TextInputVariant = "comment" | "dark" | "light";

export type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  hasEndAction?: boolean;
  state?: TextInputState;
  variant?: TextInputVariant;
  wrapperClassName?: string;
};

export function TextInput({
  className,
  disabled,
  hasEndAction = false,
  id,
  name,
  readOnly,
  state = "default",
  variant = "light",
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
        variant !== "light" && `text_input_${variant}`,
        wrapperClassName,
      )}
      data-end-action={hasEndAction ? "true" : undefined}
      data-state={isView ? "view" : state}
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
