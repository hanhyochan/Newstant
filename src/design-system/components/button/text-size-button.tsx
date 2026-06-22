import type { ButtonHTMLAttributes } from "react";

import { Icon } from "../icon/icon";
import { cn } from "../shared/utils";

export type TextSizeButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

export function TextSizeButton({
  className,
  type = "button",
  ...props
}: TextSizeButtonProps) {
  return (
    <button
      className={cn("newsroll_text_size_button", className)}
      type={type}
      {...props}
    >
      <Icon name="sizeIncrease" />
    </button>
  );
}
