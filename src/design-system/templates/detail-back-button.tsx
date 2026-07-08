import type { ButtonHTMLAttributes } from "react";

import { IconButton } from "../components/button/icon-button";
import { cn } from "@/design-system/utils/cn";

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
      className={cn("btn_detailBack", className)}
      icon="chevron"
      label={ariaLabel}
      iconSize={18}
      tone="translucent"
      type={type}
      variant="shaped"
      {...props}
    />
  );
}
