import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./utils";

type CardRadius = "square" | "rounded" | "full";
type CardVariant = "filled" | "outline" | "gray_line_outline";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  radius?: CardRadius;
  variant?: CardVariant;
};

export function Card({
  children,
  className,
  radius = "rounded",
  variant = "gray_line_outline",
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "card",
        `card_${variant}`,
        radius === "square" && "card_square",
        radius === "rounded" && "card_rounded",
        radius === "full" && "card_full",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
