import { useId, type TextareaHTMLAttributes } from "react";

import { cn } from "../shared/utils";

type TextareaSize = "small" | "medium" | "large";
type TextareaVariant = "filled" | "outline";
type TextareaRadius = "square" | "rounded";
type TextareaState = "default" | "error" | "view";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  active?: boolean;
  radius?: TextareaRadius;
  shape?: TextareaRadius;
  size?: TextareaSize;
  state?: TextareaState;
  textareaSize?: TextareaSize;
  variant?: TextareaVariant;
};

export function Textarea({
  active = false,
  className,
  disabled,
  id,
  name,
  radius,
  readOnly,
  shape,
  size,
  state = "default",
  textareaSize,
  variant = "outline",
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const isView = state === "view" || readOnly;
  const resolvedRadius = radius ?? shape ?? "rounded";
  const resolvedSize = size ?? textareaSize ?? "medium";
  const fieldId = id ?? generatedId;

  return (
    <textarea
      className={cn(
        "textarea",
        `textarea_${resolvedSize}`,
        `textarea_${variant}`,
        resolvedRadius === "rounded" && "textarea_rounded",
        state === "error" && "textarea_error",
        active && "textarea_active",
        disabled && "textarea_disabled",
        isView && "textarea_view",
        className,
      )}
      disabled={disabled}
      id={fieldId}
      name={name}
      readOnly={isView}
      {...props}
    />
  );
}
