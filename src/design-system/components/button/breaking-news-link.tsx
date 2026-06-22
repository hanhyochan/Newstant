import type { MouseEventHandler } from "react";

import { Icon } from "../icon/icon";
import { cn } from "../shared/utils";

export type BreakingNewsCardLinkProps = {
  className?: string;
  href?: string;
  id?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  showIcon?: boolean;
  title: string;
  tone?: "purple" | "white";
  updatedAt?: string;
  variant?: "home" | "list";
};

export function BreakingNewsCardLink({
  className: extraClassName,
  href,
  id,
  onClick,
  showIcon = false,
  title,
  tone = "purple",
  updatedAt,
  variant = "list",
}: BreakingNewsCardLinkProps) {
  const baseClassName =
    variant === "home" ? "btn_link_breakingNews" : "newsroll_all_breaking_card";
  const cardClassName = cn(
    baseClassName,
    "newsroll_breakingCardLink",
    tone === "white" && "newsroll_breakingCardLink_white",
    extraClassName,
  );
  const titleClassName =
    variant === "home" ? "text_breakingNewsTitle" : "text_breakingCardTitle";
  const content = (
    <>
      {showIcon ? <Icon name="policy" /> : null}
      <span className={titleClassName}>{title}</span>
    </>
  );

  if (href) {
    return (
      <a
        className={cardClassName}
        data-updated-at={updatedAt}
        href={href}
        id={id}
        onClick={onClick as MouseEventHandler<HTMLAnchorElement>}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      className={cardClassName}
      data-updated-at={updatedAt}
      id={id}
      onClick={onClick as MouseEventHandler<HTMLButtonElement>}
      type="button"
    >
      {content}
    </button>
  );
}

export function WhiteBreakingNewsCardLink(props: Omit<BreakingNewsCardLinkProps, "tone">) {
  return <BreakingNewsCardLink {...props} tone="white" variant="home" />;
}
