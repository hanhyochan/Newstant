import type { MouseEventHandler } from "react";

import { Icon } from "../icon/icon";

export type BreakingNewsLinkProps = {
  href: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  title: string;
};

export function BreakingNewsLink({ href, onClick, title }: BreakingNewsLinkProps) {
  return (
    <a className="btn_link_breakingNews" href={href} onClick={onClick}>
      <Icon name="alarm" />
      <span className="text_breakingNewsTitle">{title}</span>
    </a>
  );
}
