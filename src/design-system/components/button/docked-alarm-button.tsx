import type { ButtonHTMLAttributes } from "react";

import { Icon } from "../icon/icon";
import { cn } from "../shared/utils";

export type DockedAlarmButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

export function DockedAlarmButton({
  className,
  type = "button",
  ...props
}: DockedAlarmButtonProps) {
  return (
    <button
      className={cn(
        "btn",
        "btn_large",
        "btn_outline",
        "btn_full_rounded",
        "btn_icon",
        "newsroll_homeDockedAlarm",
        className,
      )}
      type={type}
      {...props}
    >
      <Icon name="policy" />
    </button>
  );
}
