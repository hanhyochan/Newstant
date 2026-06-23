import type { ButtonHTMLAttributes, ReactNode } from "react";

import { NewsRollSwitch } from "../shared/switch";
import { cn } from "../shared/utils";

export interface SettingRowButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  checked?: boolean;
  label: ReactNode;
  showChevron?: boolean;
}

export function SettingRowButton({
  checked,
  className,
  label,
  showChevron = false,
  type = "button",
  ...props
}: SettingRowButtonProps) {
  return (
    <button
      aria-pressed={checked}
      className={cn(
        "btn_mySettingRow",
        showChevron && "btn_mySettingRowLink",
        className,
      )}
      type={type}
      {...props}
    >
      <span className="text_mySettingLabel">{label}</span>
      {typeof checked === "boolean" ? <NewsRollSwitch checked={checked} /> : null}
      {showChevron ? <span className="icon_myChevron" aria-hidden="true" /> : null}
    </button>
  );
}
