import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "../shared/utils";

export type FieldActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function FieldActionButton({
  children,
  className,
  type = "button",
  ...props
}: FieldActionButtonProps) {
  return (
    <button
      className={cn(
        "btn",
        "btn_medium",
        "btn_outline",
        "btn_rounded",
        "btn_commentMineFilter",
        "btn_signupVerificationSend",
        className,
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
