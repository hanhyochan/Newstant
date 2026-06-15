import type { MouseEventHandler } from "react";

import { ChipLabel } from "../chip/chip-label";

export type NewsBlockItemProps = {
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

export function NewsBlockItem({
  ariaPressed,
  categoryLabel,
  dateLabel,
  dateTime,
  imageAlt = "",
  imageSrc,
  onClick,
  showDate = true,
  title,
}: NewsBlockItemProps) {
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
