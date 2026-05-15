import type { SelectHTMLAttributes } from "react";

import { cn } from "./utils";

type SelectSize = "small" | "medium" | "large";
type SelectVariant = "filled" | "outline";
type SelectRadius = "square" | "rounded" | "full";

export type SelectOption = {
  disabled?: boolean;
  hidden?: boolean;
  label: string;
  value: string;
};

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  active?: boolean;
  options: SelectOption[];
  radius?: SelectRadius;
  selectSize?: SelectSize;
  shape?: SelectRadius;
  size?: SelectSize;
  variant?: SelectVariant;
};

export function Select({
  active = false,
  className,
  disabled,
  options,
  radius,
  selectSize,
  shape,
  size,
  variant = "outline",
  ...props
}: SelectProps) {
  const resolvedRadius = radius ?? shape ?? "rounded";
  const resolvedSize = size ?? selectSize ?? "medium";

  return (
    <select
      className={cn(
        "select",
        `select_${resolvedSize}`,
        `select_${variant}`,
        resolvedRadius === "rounded" && "select_rounded",
        resolvedRadius === "full" && "select_full_rounded",
        active && "select_active",
        disabled && "select_disabled",
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {options.map((option) => (
        <option disabled={option.disabled} hidden={option.hidden} key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
