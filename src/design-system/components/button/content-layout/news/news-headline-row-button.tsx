import type { MouseEventHandler } from "react";

import { NewsCardMeta } from "./news-meta";

export type NewsHeadlineRowButtonItem = {
  image: string;
  title: string;
};

export type NewsHeadlineRowButtonProps = {
  item: NewsHeadlineRowButtonItem;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

export function NewsHeadlineRowButton({
  item,
  onClick,
}: NewsHeadlineRowButtonProps) {
  return (
    <button
      aria-label={`헤드라인 기사: ${item.title}`}
      className="newsroll_all_headline_item wrapper_betweenRow"
      onClick={onClick}
      type="button"
    >
      <span className="wrapper_contentMeta">
        <strong>{item.title}</strong>
        <NewsCardMeta />
      </span>
      <img alt="" className="newsroll_all_headline_image" src={item.image} />
    </button>
  );
}
