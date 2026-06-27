import type { MouseEventHandler } from "react";

import { ChipLabel } from "@/design-system/components/data-display/chip-label";
import { DateTimeText } from "@/design-system/components/data-display/date-time-text";

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
      className="btn_newsBlockItem wrapper_contentMeta"
      onClick={onClick}
      type="button"
    >
      {categoryLabel ? (
        <span className="newsroll_blockKicker">
          <ChipLabel>{categoryLabel}</ChipLabel>
        </span>
      ) : null}
      <img alt={imageAlt} src={imageSrc} />
      <strong>{title}</strong>
      {showDate ? (
        <p className="newsroll_blockMeta wrapper_betweenRow">
          <DateTimeText className="newsroll_createdTime" dateTime={dateTime}>
            {dateLabel}
          </DateTimeText>
        </p>
      ) : null}
    </button>
  );
}
