import type { MouseEventHandler } from "react";

import { NewsCardMeta } from "./news-meta";

export type NewsListCardButtonItem = {
  image: string;
  title: string;
};

export type NewsListCardButtonProps = {
  featured?: boolean;
  item: NewsListCardButtonItem;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

export function NewsListCardButton({
  featured = false,
  item,
  onClick,
}: NewsListCardButtonProps) {
  return (
    <button
      aria-label={`릴레이 뉴스 기사: ${item.title}`}
      className="newsroll_all_relay_item"
      onClick={onClick}
      type="button"
    >
      <strong
        className={featured ? "newsroll_all_relay_title_large" : undefined}
      >
        {item.title}
      </strong>
      <NewsCardMeta />
      <img alt="" src={item.image} />
    </button>
  );
}
