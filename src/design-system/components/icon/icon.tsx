export type IconName =
  | "alarm"
  | "allNews"
  | "arrow"
  | "bookmark"
  | "chevronRight"
  | "chat"
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

export type IconSize = 12 | 20;

export function Icon({ name, size }: { name: IconName; size?: IconSize }) {
  const iconSize = size ?? 20;
  const sizeClassName = `newsroll_icon_${iconSize}`;

  return <span aria-hidden="true" className={`${sizeClassName} newsroll_icon_${name}`} />;
}
