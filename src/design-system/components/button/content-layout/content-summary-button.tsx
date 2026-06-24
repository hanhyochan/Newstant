import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ContentSummaryButtonProps =
  ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    selected?: boolean;
  };

export function ContentSummaryButton({
  "aria-pressed": ariaPressed,
  children,
  className,
  selected = false,
  ...props
}: ContentSummaryButtonProps) {
  const classNames = [
    className,
    selected && "is_selected",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      aria-pressed={ariaPressed ?? (selected ? true : undefined)}
      className={classNames}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
