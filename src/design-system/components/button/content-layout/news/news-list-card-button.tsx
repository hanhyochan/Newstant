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
      className="btn_newsCardList wrapper_contentMeta"
      onClick={onClick}
      type="button"
    >
      <strong
        className={featured ? "text_newsCardTitleLarge" : undefined}
      >
        {item.title}
      </strong>
      <NewsCardMeta />
      <img alt="" src={item.image} />
    </button>
  );
}
