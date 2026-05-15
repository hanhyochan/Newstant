import type { ButtonHTMLAttributes, ReactNode } from "react";

import { Icon, type IconName } from "../icon/icon";
import { cn } from "../shared/utils";

type ReactionTone = "like" | "dislike" | "neutral";

export type ReactionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  icon: IconName;
  tone: ReactionTone;
  variant: "article" | "comment";
};

export function ReactionButton({
  children,
  className,
  icon,
  tone,
  type = "button",
  variant,
  ...props
}: ReactionButtonProps) {
  const prefix = variant === "article" ? "btn_articleReaction" : "btn_commentReaction";
  const toneClassName = `${prefix}_${tone}`;

  return (
    <button className={cn(toneClassName, className)} type={type} {...props}>
      <Icon name={icon} />
      {children}
    </button>
  );
}
