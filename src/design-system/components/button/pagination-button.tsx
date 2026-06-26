import type { ButtonHTMLAttributes } from "react";

import { Icon } from "../icon/icon";

export type PaginationButtonDirection = "previous" | "next";

export type PaginationButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "className"
> & {
  direction: PaginationButtonDirection;
};

export function PaginationButton({
  direction,
  ...props
}: PaginationButtonProps) {
  const isPrevious = direction === "previous";

  return (
    <button
      className="btn_pagination"
      data-direction={direction}
      type="button"
      {...props}
    >
      {isPrevious ? <Icon name="arrow" /> : null}
      {isPrevious ? "이전글" : "다음글"}
      {isPrevious ? null : <Icon name="arrow" />}
    </button>
  );
}
