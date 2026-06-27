import type { MouseEventHandler } from "react";

import { Icon } from "../icon/icon";
import { cn } from "@/design-system/utils/cn";

export type NoticeCardLinkType =
  | "breaking"
  | "notificationRead"
  | "notificationUnread";

export type NoticeCardLinkProps = {
  href?: string;
  id?: string;
  isListItem?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  showIcon?: boolean;
  title: string;
  type?: NoticeCardLinkType;
  updatedAt?: string;
};

export function NoticeCardLink({
  href,
  id,
  isListItem = false,
  onClick,
  showIcon = false,
  title,
  type = "breaking",
  updatedAt,
}: NoticeCardLinkProps) {
  const baseClassName =
    isListItem ? "btn_noticeListCardLink" : "btn_noticeCardLink";
  const cardClassName = cn(
    baseClassName,
    "noticeCardLink",
    `noticeCardLink_${type}`,
  );
  const titleClassName =
    isListItem ? "text_noticeListCardTitle" : "text_noticeCardTitle";
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
