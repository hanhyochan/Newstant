import type { ButtonHTMLAttributes } from "react";

import { cn } from "../shared/utils";

export interface ChevronIconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  iconClassName?: string;
  label: string;
}

export function ChevronIconButton({
  className,
  iconClassName,
  label,
  type = "button",
  ...props
}: ChevronIconButtonProps) {
  return (
    <button
      aria-label={label}
      className={className}
      type={type}
      {...props}
    >
      <span
        className={cn("icon_myChevron", iconClassName)}
        aria-hidden="true"
      />
    </button>
  );
}
