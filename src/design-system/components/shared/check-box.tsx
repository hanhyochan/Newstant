import type { HTMLAttributes } from "react";

import { cn } from "../shared/utils";

export type NewsRollCheckBoxProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  checked?: boolean;
};

export function NewsRollCheckBox({
  checked = false,
  className,
  ...props
}: NewsRollCheckBoxProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("box_newsrollCheck", checked && "is_checked", className)}
      {...props}
    >
      {checked ? "✓" : ""}
    </span>
  );
}
