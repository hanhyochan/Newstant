import type { ButtonHTMLAttributes } from "react";

import { IconButton } from "../components/button/icon-button";
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
    <IconButton
      className={cn("newsroll_homeDetailBack newsroll_all_detail_back", className)}
      icon="chevron"
      label={ariaLabel}
      tone="translucent"
      type={type}
      variant="shaped"
      {...props}
    />
  );
}
