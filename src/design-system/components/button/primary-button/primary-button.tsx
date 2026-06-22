import type { ButtonHTMLAttributes } from "react";

import { cn } from "../../shared/utils";

export type PrimaryButtonTone = "default" | "neutral" | "danger";

export interface PrimaryButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: PrimaryButtonTone;
}

export function PrimaryButton({
  children,
  className,
  tone = "default",
  type = "button",
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "btn",
        "btn_large",
        "btn_filled",
        "btn_rounded",
        tone === "neutral" && "btn_primaryNeutral",
        tone === "danger" && "btn_danger",
        className,
      )}
      type={type}
    >
      {children}
    </button>
  );
}
