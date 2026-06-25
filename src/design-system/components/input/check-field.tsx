import type { InputHTMLAttributes, ReactNode } from "react";
import { useId } from "react";

import { cn } from "../shared/utils";

export type NewsRollCheckSize = "md" | "lg";

export type NewsRollCheckBoxProps = {
  checked?: boolean;
  className?: string;
  size?: NewsRollCheckSize;
};

export function NewsRollCheckBox({
  checked = false,
  className,
  size = "md",
}: NewsRollCheckBoxProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("box_newsrollCheck", checked && "is_checked", className)}
      data-size={size}
    />
  );
}

type BaseCheckInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "children" | "size" | "type"
>;

export type NewsRollCheckFieldProps = BaseCheckInputProps & {
  checked?: boolean;
  label: ReactNode;
  size?: NewsRollCheckSize;
};

export function NewsRollCheckField({
  checked = false,
  className,
  label,
  size = "md",
  id,
  ...props
}: NewsRollCheckFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <label
      className={cn("btn_newsrollCheckField", className)}
      data-size={size}
    >
      <input
        {...props}
        checked={checked}
        className="input_newsrollCheck"
        id={inputId}
        type="checkbox"
      />
      <NewsRollCheckBox checked={checked} size={size} />
      <span>{label}</span>
    </label>
  );
}

export type NewsRollCheckIconFieldProps = BaseCheckInputProps & {
  ariaLabel: string;
  checked?: boolean;
  size?: NewsRollCheckSize;
};

export function NewsRollCheckIconField({
  ariaLabel,
  checked = false,
  className,
  size = "md",
  id,
  ...props
}: NewsRollCheckIconFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <label
      className={cn("btn_newsrollCheckIconField", className)}
      data-size={size}
    >
      <input
        {...props}
        aria-label={ariaLabel}
        checked={checked}
        className="input_newsrollCheck"
        id={inputId}
        type="checkbox"
      />
      <NewsRollCheckBox checked={checked} size={size} />
    </label>
  );
}
