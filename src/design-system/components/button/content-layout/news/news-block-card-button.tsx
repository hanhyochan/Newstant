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
      className="btn_newsCardBlock wrapper_contentMeta u_gap8"
      onClick={onClick}
      type="button"
    >
      {categoryLabel ? (
        <span className="wrapper_newsCardKicker">
          <ChipLabel>{categoryLabel}</ChipLabel>
        </span>
      ) : null}
      <img alt={imageAlt} src={imageSrc} />
      <strong>{title}</strong>
      {showDate ? (
        <p className="wrapper_newsCardDateRow wrapper_betweenRow u_m0">
          <DateTimeText dateTime={dateTime}>
            {dateLabel}
          </DateTimeText>
        </p>
      ) : null}
    </button>
  );
}
