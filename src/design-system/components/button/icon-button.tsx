import type { ButtonHTMLAttributes } from "react";

import { Icon, type IconName, type IconSize } from "../icon/icon";
import { cn } from "../shared/utils";

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  hasUnreadIndicator?: boolean;
  tone?: "primary" | "translucent";
  icon: IconName | null;
  iconSize?: IconSize;
  label: string;
  variant?: "plain" | "shaped" | "bottomNav";
};

export function IconButton({
  className,
  hasUnreadIndicator = false,
  icon,
  iconSize,
  label,
  tone = "primary",
  type = "button",
  variant = "plain",
  ...props
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={cn(
        "btn_iconButton",
        `btn_iconButton_${variant}`,
        variant === "shaped" && `btn_iconButton_${tone}`,
        className,
      )}
      type={type}
      {...props}
    >
      {hasUnreadIndicator ? (
        <span className="badge_iconButtonUnread" aria-hidden="true" />
      ) : null}
      {icon ? <Icon name={icon} size={iconSize} /> : <span aria-hidden="true" />}
    </button>
  );
}
