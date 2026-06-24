import type { HTMLAttributes } from "react";

import { cn } from "../shared/utils";

export type ToggleSwitchProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  checked?: boolean;
};

export function ToggleSwitch({
  checked = false,
  className,
  ...props
}: ToggleSwitchProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("switch_newsToggle", checked && "is_on", className)}
      {...props}
    />
  );
}

export { ToggleSwitch as NewsRollSwitch };
