import { useId, type TextareaHTMLAttributes } from "react";

import { cn } from "../shared/utils";

type TextareaState = "default" | "error" | "view";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  state?: TextareaState;
};

export function Textarea({
  className,
  disabled,
  id,
  name,
  readOnly,
  state = "default",
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const isView = state === "view" || readOnly;
  const fieldId = id ?? generatedId;

  return (
    <textarea
      className={cn(
        "textarea",
        "textarea_large",
        "textarea_outline",
        "textarea_rounded",
        state === "error" && "textarea_error",
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
