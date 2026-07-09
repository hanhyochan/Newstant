import type { ButtonHTMLAttributes } from "react";

import { IconButton } from "../components/button/icon-button";
import { cn } from "@/design-system/utils/cn";

type DetailBackButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "children"> & {
  ariaLabel: string;
};

export function DetailBackButton({
  ariaLabel,
  className,
  type = "button",
  ...props
}: DetailBackButtonProps) {
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
