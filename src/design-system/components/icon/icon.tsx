export type IconName =
  | "alarm"
  | "allNews"
  | "arrow"
  | "bookmark"
  | "chevron"
  | "chat"
  | "close"
  | "detail"
  | "dots"
  | "earth"
  | "eye"
  | "fourSquare"
  | "home"
  | "information"
  | "list"
  | "loudspeaker"
  | "myPage"
  | "plus"
  | "policy"
  | "question"
  | "search"
  | "setting"
  | "share"
  | "sizeIncrease"
  | "submit"
  | "thumbDown"
  | "thumbUp"
  | "user"
  | "vote";

export type IconSize = 12 | 18 | 20;

export function Icon({
  className,
  name,
  size,
}: {
  className?: string;
  name: IconName;
  size?: IconSize;
}) {
  const iconSize = size ?? 20;

  return (
    <span
      aria-hidden="true"
      className={["icon", `icon_${name}`, className].filter(Boolean).join(" ")}
      data-size={iconSize}
    />
  );
}
