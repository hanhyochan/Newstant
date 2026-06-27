import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/design-system/utils/cn";

export type TextButtonTone = "default" | "danger";

export interface TextButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: TextButtonTone;
}

export function TextButton({
  children,
  className,
  tone = "default",
  type = "button",
  ...props
}: TextButtonProps) {
  return (
    <button
      {...props}
      className={cn("btn_textAction", className)}
      data-tone={tone}
      type={type}
    >
      {children}
    </button>
  );
}
