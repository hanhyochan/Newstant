import type { MouseEventHandler } from "react";

export type NewsBlockItemProps = {
  ariaPressed?: boolean;
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
