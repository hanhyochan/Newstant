export type IconName =
  | "alarm"
  | "allNews"
  | "bookmark"
  | "chevronRight"
  | "chat"
  | "detail"
  | "dots"
  | "earth"
  | "fourSquare"
  | "home"
  | "information"
  | "list"
  | "loudspeaker"
  | "menu"
  | "myPage"
  | "plus"
  | "policy"
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
