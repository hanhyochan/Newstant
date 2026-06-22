import type { ButtonHTMLAttributes } from "react";

import { cn } from "../shared/utils";

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
      className={cn(
        "btn_textAction",
        tone === "danger" && "btn_textActionDanger",
        className,
      )}
      type={type}
    >
      {children}
    </button>
  );
}
