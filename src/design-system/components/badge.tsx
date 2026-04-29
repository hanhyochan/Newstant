import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./utils";

type BadgeSize = "small" | "medium";
type BadgeVariant = "filled" | "outline" | "gray_line_outline";
type BadgeRadius = "square" | "rounded" | "full";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  badgeSize?: BadgeSize;
  radius?: BadgeRadius;
  size?: BadgeSize;
  variant?: BadgeVariant;
};

export function Badge({
  badgeSize,
  children,
  className,
  radius = "full",
  size,
  variant = "filled",
  ...props
}: BadgeProps) {
  const resolvedSize = size ?? badgeSize ?? "small";

  return (
    <span
      className={cn(
        "badge",
        `badge_${resolvedSize}`,
        `badge_${variant}`,
        radius === "square" && "badge_square",
        radius === "rounded" && "badge_rounded",
        radius === "full" && "badge_full",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
