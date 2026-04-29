import type { InputHTMLAttributes } from "react";

import { cn } from "./utils";

type TextInputSize = "small" | "medium" | "large" | "xlarge";
type TextInputVariant = "filled" | "outline";
type TextInputRadius = "square" | "rounded" | "full";
type TextInputState = "default" | "complete" | "error" | "view";

export type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  active?: boolean;
  inputSize?: TextInputSize;
  radius?: TextInputRadius;
  shape?: TextInputRadius;
  size?: TextInputSize;
  state?: TextInputState;
  variant?: TextInputVariant;
  wrapperClassName?: string;
};

export function TextInput({
  active = false,
  className,
  disabled,
  inputSize,
  radius,
  readOnly,
  shape,
  size,
  state = "default",
  variant = "outline",
  wrapperClassName,
  ...props
}: TextInputProps) {
  const isView = state === "view" || readOnly;
  const resolvedRadius = radius ?? shape ?? "rounded";
  const resolvedSize = size ?? inputSize ?? "medium";

  return (
    <label
      className={cn(
        "text_input",
        `text_input_${resolvedSize}`,
        `text_input_${variant}`,
        resolvedRadius === "rounded" && "text_input_rounded",
        resolvedRadius === "full" && "text_input_full_rounded",
        state === "complete" && "text_input_complete",
        state === "error" && "text_input_error",
        active && "text_input_active",
        disabled && "text_input_disabled",
        isView && "text_input_view",
        wrapperClassName,
      )}
    >
      <input
        className={className}
        disabled={disabled}
        readOnly={isView}
        {...props}
      />
    </label>
  );
}
