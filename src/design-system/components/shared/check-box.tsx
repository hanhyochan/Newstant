import type { InputHTMLAttributes, ReactNode } from "react";
import { useId } from "react";

import { cn } from "../shared/utils";

export type NewsRollCheckSize = "default" | "small";

export type NewsRollCheckBoxProps = {
  checked?: boolean;
  className?: string;
  size?: NewsRollCheckSize;
};

export function NewsRollCheckBox({
  checked = false,
  className,
  size = "default",
}: NewsRollCheckBoxProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("box_newsrollCheck", checked && "is_checked", className)}
      data-size={size}
    />
  );
}

export type NewsRollCheckFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "children" | "size" | "type"
> & {
  checked?: boolean;
  label: ReactNode;
  size?: NewsRollCheckSize;
};

export function NewsRollCheckField({
  checked = false,
  className,
  label,
  size = "default",
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
