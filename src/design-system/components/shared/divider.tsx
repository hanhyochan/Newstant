import type { HTMLAttributes } from "react";

import { cn } from "./utils";

export type DividerProps = HTMLAttributes<HTMLSpanElement> & {
  orientation?: "horizontal" | "vertical";
};

export function Divider({
  className,
  orientation = "horizontal",
  ...props
}: DividerProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("divider", className)}
      data-orientation={orientation}
      role="presentation"
      {...props}
    />
  );
}
