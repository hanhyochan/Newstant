import { useId, type TextareaHTMLAttributes } from "react";

type TextareaState = "default" | "error" | "view";
export type TextareaVariant = "default" | "commentEdit" | "inquiry";

export type TextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "className"
> & {
  state?: TextareaState;
  variant?: TextareaVariant;
};

export function Textarea({
  disabled,
  id,
  name,
  readOnly,
  state = "default",
  variant = "default",
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const isView = state === "view" || readOnly;
  const fieldId = id ?? generatedId;

  return (
    <textarea
      className="textarea"
      data-state={isView ? "view" : state}
      data-variant={variant}
      disabled={disabled}
      id={fieldId}
      name={name}
      readOnly={isView}
      {...props}
    />
  );
}
