import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "../shared/utils";

export type FieldActionButtonTone = "purple" | "white";

export type FieldActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  tone?: FieldActionButtonTone;
};

export function FieldActionButton({
  children,
  className,
  tone = "purple",
  type = "button",
  ...props
}: FieldActionButtonProps) {
  return (
    <button
      className={cn("btn_fieldActionButton", `btn_fieldActionButton_${tone}`, className)}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
