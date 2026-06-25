import type { MouseEventHandler } from "react";

import { ChipLabel } from "@/design-system/components/chip/chip-label";

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
      <ChipLabel>{item.category}</ChipLabel>
      <img alt="" className="newsroll_all_latest_image" src={item.image} />
      <span className="newsroll_all_latest_body">
        <strong>{item.title}</strong>
        <NewsCardMeta />
      </span>
    </button>
  );
}
