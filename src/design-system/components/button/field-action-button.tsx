import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/design-system/utils/cn";

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
      className={cn("btn_fieldActionButton", className)}
      data-tone={tone}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
