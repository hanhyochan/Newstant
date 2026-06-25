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
        className,
      )}
      data-state={isView ? "view" : state}
      disabled={disabled}
      id={fieldId}
      name={name}
      readOnly={isView}
      {...props}
    />
  );
}
