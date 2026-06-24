import type { MouseEventHandler } from "react";

import { NewsCardMeta } from "./news-meta";

export type NewsFeatureCardButtonItem = {
  category?: string;
  image: string;
  title: string;
};

export type NewsFeatureCardButtonProps = {
  item: NewsFeatureCardButtonItem;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

export function NewsFeatureCardButton({
  item,
  onClick,
}: NewsFeatureCardButtonProps) {
  return (
    <button
      aria-label={`${item.category ?? "뉴스"} 기사: ${item.title}`}
      className="newsroll_all_latest_card"
      onClick={onClick}
      type="button"
    >
      <span className="chip chip_small chip_filled chip_full newsroll_all_chip">
        {item.category}
      </span>
      <img alt="" className="newsroll_all_latest_image" src={item.image} />
      <span className="newsroll_all_latest_body">
        <strong>{item.title}</strong>
        <NewsCardMeta />
      </span>
    </button>
  );
}
