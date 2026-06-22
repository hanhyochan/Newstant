import type { ButtonHTMLAttributes } from "react";

import { Icon } from "../icon/icon";
import { OriginalArticleButton } from "./original-article-button";

export type DetailPaginationButtonDirection = "previous" | "next";

export type DetailPaginationButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  direction: DetailPaginationButtonDirection;
};

export function DetailPaginationButton({
  direction,
  ...props
}: DetailPaginationButtonProps) {
  const isPrevious = direction === "previous";

  return (
    <OriginalArticleButton
      className="newsroll_policy_detail_page_button"
      type="button"
      {...props}
    >
      {isPrevious ? <Icon name="arrow" /> : null}
      {isPrevious ? "이전글" : "다음글"}
      {isPrevious ? null : <Icon name="arrow" />}
    </OriginalArticleButton>
  );
}
