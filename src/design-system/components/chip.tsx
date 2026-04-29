import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "./utils";

type ChipSize = "small" | "medium" | "large";
type ChipVariant = "filled" | "outline" | "gray_line_outline";
type ChipRadius = "square" | "rounded" | "full";

export type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  children: ReactNode;
  radius?: ChipRadius;
  size?: ChipSize;
  chipSize?: ChipSize;
  variant?: ChipVariant;
};

export function Chip({
  active = false,
  children,
  chipSize,
  className,
  disabled,
  radius = "full",
  size,
  variant = "gray_line_outline",
  ...props
}: ChipProps) {
  const resolvedSize = size ?? chipSize ?? "medium";

  return (
    <button
      className={cn(
        "chip",
        `chip_${resolvedSize}`,
        `chip_${variant}`,
        radius === "square" && "chip_square",
        radius === "rounded" && "chip_rounded",
        radius === "full" && "chip_full",
        active && "chip_active",
        disabled && "chip_disabled",
        className,
      )}
      disabled={disabled}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
