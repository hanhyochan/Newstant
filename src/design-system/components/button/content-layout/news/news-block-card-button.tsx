import type { MouseEventHandler } from "react";

import { ChipLabel } from "@/design-system/components/chip/chip-label";

export type NewsBlockCardButtonProps = {
  ariaPressed?: boolean;
  categoryLabel?: string;
  dateLabel: string;
  dateTime?: string;
  imageAlt?: string;
  imageSrc: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  showDate?: boolean;
  title: string;
};

export function NewsBlockCardButton({
  ariaPressed,
  categoryLabel,
  dateLabel,
  dateTime,
  imageAlt = "",
  imageSrc,
  onClick,
  showDate = true,
  title,
}: NewsBlockCardButtonProps) {
  return (
    <button
      aria-pressed={ariaPressed}
      className="btn_newsBlockItem"
      onClick={onClick}
      type="button"
    >
      {categoryLabel ? (
        <span className="newsroll_blockKicker">
          <ChipLabel kind="articleCategory">{categoryLabel}</ChipLabel>
        </span>
      ) : null}
      <img alt={imageAlt} src={imageSrc} />
      <strong>{title}</strong>
      {showDate ? (
        <p className="newsroll_blockMeta">
          <time className="newsroll_createdTime" dateTime={dateTime}>
            {dateLabel}
          </time>
        </p>
      ) : null}
    </button>
  );
}
