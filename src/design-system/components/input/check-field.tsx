import type { InputHTMLAttributes, ReactNode } from "react";
import { useId } from "react";

export type CheckSize = "md" | "lg";
export type CheckVariant = "withText" | "withoutText";
export type CheckRole =
  | "default"
  | "autoLogin"
  | "agreementAll"
  | "selectAll"
  | "selectionItem"
  | "chevronRow";

type BaseCheckInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "children" | "className" | "size" | "type"
>;

type CheckInputWithTextProps = BaseCheckInputProps & {
  checked?: boolean;
  className?: string;
  label: ReactNode;
  role?: CheckRole;
  size?: CheckSize;
  variant?: "withText";
};

type CheckInputWithoutTextProps = BaseCheckInputProps & {
  ariaLabel: string;
  checked?: boolean;
  className?: string;
  label?: never;
  role?: CheckRole;
  size?: CheckSize;
  variant: "withoutText";
};

export type CheckInputProps =
  | CheckInputWithTextProps
  | CheckInputWithoutTextProps;

export function CheckInput(props: CheckInputProps) {
  const checked = props.checked ?? false;
  const role = props.role ?? "default";
  const size = props.size ?? "md";
  const variant = props.variant ?? "withText";
  const inputProps =
    props.variant === "withoutText"
      ? getWithoutTextInputProps(props)
      : getWithTextInputProps(props);
  const ariaLabel =
    props.variant === "withoutText" ? props.ariaLabel : undefined;
  const label = props.variant === "withoutText" ? undefined : props.label;
  const generatedId = useId();
  const inputId = props.id ?? generatedId;

  return (
    <label
      className={["field_check", props.className].filter(Boolean).join(" ")}
      data-role={role}
      data-size={size}
      data-variant={variant}
    >
      <input
        {...inputProps}
        aria-label={ariaLabel}
        checked={checked}
        className="input_check"
        id={inputId}
        type="checkbox"
      />
      <span
        aria-hidden="true"
        className={checked ? "box_check is_checked" : "box_check"}
        data-size={size}
      />
      {variant === "withText" ? <span>{label}</span> : null}
    </label>
  );
}

function getWithTextInputProps(props: CheckInputWithTextProps) {
  const {
    checked: _checked,
    className: _className,
    id: _id,
    label: _label,
    role: _role,
    size: _size,
    variant: _variant,
    ...inputProps
  } = props;

  return inputProps;
}

function getWithoutTextInputProps(props: CheckInputWithoutTextProps) {
  const {
    ariaLabel: _ariaLabel,
    checked: _checked,
    className: _className,
    id: _id,
    role: _role,
    size: _size,
    variant: _variant,
    ...inputProps
  } = props;

  return inputProps;
}
