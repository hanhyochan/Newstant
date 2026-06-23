import type { ButtonHTMLAttributes } from "react";

import { Icon } from "../icon/icon";
import { cn } from "../shared/utils";

export type PaginationButtonDirection = "previous" | "next";

export type PaginationButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  direction: PaginationButtonDirection;
};

export function PaginationButton({
  className,
  direction,
  ...props
}: PaginationButtonProps) {
  const isPrevious = direction === "previous";

  return (
    <button
      className={cn("btn_originalArticle", "newsroll_policy_detail_page_button", className)}
      type="button"
      {...props}
    >
      {isPrevious ? <Icon name="arrow" /> : null}
      {isPrevious ? "이전글" : "다음글"}
      {isPrevious ? null : <Icon name="arrow" />}
    </button>
  );
}
