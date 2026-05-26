import type { HTMLAttributes } from "react";

import { cn } from "./utils";

export type NewsRollDividerProps = HTMLAttributes<HTMLSpanElement> & {
  orientation?: "horizontal" | "vertical";
};

export function NewsRollDivider({
  className,
  orientation = "horizontal",
  ...props
}: NewsRollDividerProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("newsroll_divider", `newsroll_divider_${orientation}`, className)}
      role="presentation"
      {...props}
    />
  );
}
