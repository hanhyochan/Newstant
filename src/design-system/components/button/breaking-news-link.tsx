import type { MouseEventHandler } from "react";

import { Icon } from "../icon/icon";

export type BreakingNewsLinkProps = {
  href: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  title: string;
};

export type BreakingNewsCardLinkProps = {
  href?: string;
  id?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  showIcon?: boolean;
  title: string;
  updatedAt?: string;
  variant?: "home" | "list";
};

export function BreakingNewsCardLink({
  href,
  id,
  onClick,
  showIcon = false,
  title,
  updatedAt,
  variant = "list",
}: BreakingNewsCardLinkProps) {
  const className =
    variant === "home"
      ? "btn_link_breakingNews newsroll_breakingCardLink"
      : "newsroll_all_breaking_card newsroll_breakingCardLink";
  const titleClassName =
    variant === "home" ? "text_breakingNewsTitle" : "text_breakingCardTitle";
  const content = (
    <>
      {showIcon ? <Icon name="alarm" /> : null}
      <span className={titleClassName}>{title}</span>
    </>
  );

  if (href) {
    return (
      <a
        className={className}
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
      className={className}
      data-updated-at={updatedAt}
      id={id}
      onClick={onClick as MouseEventHandler<HTMLButtonElement>}
      type="button"
    >
      {content}
    </button>
  );
}

export function BreakingNewsLink({ href, onClick, title }: BreakingNewsLinkProps) {
  return (
    <BreakingNewsCardLink
      href={href}
      onClick={onClick}
      showIcon
      title={title}
      variant="home"
    />
  );
}
