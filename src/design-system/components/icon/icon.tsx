export type IconName =
  | "alarm"
  | "bookmark"
  | "chevronRight"
  | "chat"
  | "detail"
  | "dots"
  | "earth"
  | "fourSquare"
  | "home"
  | "list"
  | "loudspeaker"
  | "menu"
  | "plus"
  | "question"
  | "search"
  | "share"
  | "sizeIncrease"
  | "submit"
  | "thumbDown"
  | "thumbUp"
  | "user";

export function Icon({ name }: { name: IconName }) {
  return <span aria-hidden="true" className={`newsroll_icon newsroll_icon_${name}`} />;
}
