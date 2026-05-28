import type { MouseEventHandler } from "react";

export type NewsBlockItemProps = {
  ariaPressed?: boolean;
  dateLabel: string;
  dateTime?: string;
  imageAlt?: string;
  imageSrc: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  title: string;
};

export function NewsBlockItem({
  ariaPressed,
  dateLabel,
  dateTime,
  imageAlt = "",
  imageSrc,
  onClick,
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
      <p className="newsroll_blockMeta">
        <time className="newsroll_createdTime" dateTime={dateTime}>
          {dateLabel}
        </time>
      </p>
    </button>
  );
}
