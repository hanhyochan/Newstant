import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/design-system/utils/cn";

export type PrimaryButtonTone = "default" | "neutral" | "danger";

export interface PrimaryButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  leftIcon?: ReactNode;
  tone?: PrimaryButtonTone;
}

export function PrimaryButton({
  children,
  className,
  leftIcon,
  tone = "default",
  type = "button",
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "btn_primary",
        tone !== "default" && `btn_primary_${tone}`,
        className,
      )}
      type={type}
    >
      {leftIcon}
      {children}
    </button>
  );
}
