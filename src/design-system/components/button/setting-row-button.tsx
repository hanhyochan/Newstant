import type { ButtonHTMLAttributes, ReactNode } from "react";

import { ChevronRowButton } from "./chevron-row-button";
import { OnoffToggleButton } from "./onoffToggle-button";
import { cn } from "@/design-system/utils/cn";

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
  if (showChevron && typeof checked !== "boolean") {
    return (
      <ChevronRowButton
        className={cn("btn_settingRow", className)}
        data-variant="link"
        type={type}
        {...props}
      >
        <span className="text_mySettingLabel">{label}</span>
      </ChevronRowButton>
    );
  }

  return (
    <button
      aria-pressed={checked}
      className={cn(
        "btn_settingRow",
        className,
      )}
      data-variant={showChevron ? "link" : "default"}
      type={type}
      {...props}
    >
      <span className="text_mySettingLabel">{label}</span>
      {typeof checked === "boolean" ? <OnoffToggleButton checked={checked} /> : null}
      {showChevron ? <span className="icon_myChevron" aria-hidden="true" /> : null}
    </button>
  );
}
