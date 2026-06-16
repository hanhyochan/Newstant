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
  | "menu"
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

export function Icon({ name }: { name: IconName }) {
  const sizeClassName = name === "detail" ? "newsroll_icon_18" : "newsroll_icon_20";

  return <span aria-hidden="true" className={`${sizeClassName} newsroll_icon_${name}`} />;
}
