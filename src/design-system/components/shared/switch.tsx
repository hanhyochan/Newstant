import type { HTMLAttributes } from "react";

import { cn } from "./utils";

export type NewsRollSwitchProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  checked?: boolean;
};

export function NewsRollSwitch({
  checked = false,
  className,
  ...props
}: NewsRollSwitchProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("switch_newsToggle", checked && "is_on", className)}
      {...props}
    />
  );
}
