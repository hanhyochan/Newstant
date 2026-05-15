import type { ButtonHTMLAttributes } from "react";

import { Icon, type IconName } from "../icon/icon";
import { cn } from "../shared/utils";

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  baseClassName?: string;
  icon: IconName;
  label: string;
};

export function IconButton({
  baseClassName = "newsroll_icon_button",
  className,
  icon,
  label,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button aria-label={label} className={cn(baseClassName, className)} type={type} {...props}>
      <Icon name={icon} />
    </button>
  );
}
