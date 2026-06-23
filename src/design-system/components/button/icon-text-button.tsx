import type { ButtonHTMLAttributes, ReactNode } from "react";

import { Icon, type IconName } from "../icon/icon";
import { cn } from "../shared/utils";

export type IconTextButtonSize = "default" | "small";
export type FeedbackIconTextButtonTone = "dislike" | "like" | "neutral";
export type ActivityIconTextButtonTone = "bookmark" | "comment" | "vote";
export type IconTextButtonTone =
  | ActivityIconTextButtonTone
  | FeedbackIconTextButtonTone;

export type IconTextButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  icon: IconName;
  size?: IconTextButtonSize;
  tone: IconTextButtonTone;
};

export function IconTextButton({
  children,
  className,
  icon,
  size = "default",
  tone,
  type = "button",
  ...props
}: IconTextButtonProps) {
  return (
    <button
      className={cn(
        "btn_iconTextButton",
        `btn_iconTextButton_${size}`,
        `btn_iconTextButton_${tone}`,
        className,
      )}
      type={type}
      {...props}
    >
      <Icon name={icon} />
      {children}
    </button>
  );
}
