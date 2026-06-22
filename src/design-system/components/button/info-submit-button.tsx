import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "../shared/utils";

export type InfoSubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function InfoSubmitButton({
  children,
  className,
  type = "submit",
  ...props
}: InfoSubmitButtonProps) {
  return (
    <button
      className={cn(
        "btn",
        "btn_large",
        "btn_outline",
        "btn_rounded",
        "btn_infoSubmit",
        className,
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
