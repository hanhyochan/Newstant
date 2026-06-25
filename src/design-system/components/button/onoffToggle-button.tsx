import type { HTMLAttributes } from "react";

import { cn } from "../shared/utils";

export type OnoffToggleButtonProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  checked?: boolean;
};

export function OnoffToggleButton({
  checked = false,
  className,
  ...props
}: OnoffToggleButtonProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("switch_newsToggle", checked && "is_on", className)}
      {...props}
    />
  );
}
