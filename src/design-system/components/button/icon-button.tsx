import type { ButtonHTMLAttributes } from "react";

import { Icon, type IconName, type IconSize } from "../icon/icon";
import { cn } from "../shared/utils";

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  hasUnreadIndicator?: boolean;
  tone?: "danger" | "neutral" | "primary" | "translucent";
  icon: IconName;
  iconSize?: IconSize;
  label: string;
  variant?: "plain" | "shaped" | "bottomNav" | "circle";
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
        className,
      )}
      data-tone={tone}
      data-variant={variant}
      type={type}
      {...props}
    >
      {hasUnreadIndicator ? (
        <span className="badge_iconButtonUnread" aria-hidden="true" />
      ) : null}
      <Icon name={icon} size={iconSize} />
    </button>
  );
}
