import type { MouseEventHandler } from "react";

import { ChipLabel } from "@/design-system/components/data-display/chip-label";

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
      className="btn_newsCardFeature wrapper_contentMeta"
      onClick={onClick}
      type="button"
    >
      <ChipLabel>{item.category}</ChipLabel>
      <img alt="" className="img_newsCardFeature" src={item.image} />
      <span className="wrapper_contentMeta u_minH0">
        <strong>{item.title}</strong>
        <NewsCardMeta />
      </span>
    </button>
  );
}
