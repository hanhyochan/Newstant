import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

type TextInputState = "default" | "complete" | "error" | "view";
export type TextInputMode = "dark" | "light";

export type TextInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className" | "size"
> & {
  hasEndAction?: boolean;
  mode?: TextInputMode;
  rightSlot?: ReactNode;
  state?: TextInputState;
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(
    {
      disabled,
      hasEndAction = false,
      id,
      mode = "light",
      name,
      readOnly,
      rightSlot,
      state = "default",
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const isView = state === "view" || readOnly;
    const fieldId = id ?? generatedId;

    return (
      <label
        className="text_input"
        data-end-action={hasEndAction || rightSlot ? "true" : undefined}
        data-mode={mode}
        data-state={isView ? "view" : state}
      >
        <input
          disabled={disabled}
          id={fieldId}
          name={name}
          readOnly={isView}
          ref={ref}
          {...props}
        />
        {rightSlot}
      </label>
    );
  },
);
