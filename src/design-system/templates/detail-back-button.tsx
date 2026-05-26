import type { ButtonHTMLAttributes } from "react";

import { cn } from "../components/shared/utils";

type NewsRollDetailBackButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "children"> & {
  ariaLabel: string;
};

export function NewsRollDetailBackButton({
  ariaLabel,
  className,
  type = "button",
  ...props
}: NewsRollDetailBackButtonProps) {
  return (
    <button
      aria-label={ariaLabel}
      className={cn("newsroll_homeDetailBack newsroll_all_detail_back", className)}
      type={type}
      {...props}
    >
      <span aria-hidden="true" />
    </button>
  );
}
