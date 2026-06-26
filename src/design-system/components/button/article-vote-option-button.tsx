import type { ButtonHTMLAttributes, CSSProperties } from "react";

import { cn } from "../shared/utils";

export type ArticleVoteOptionButtonState = "active" | "default";
export type ArticleVoteOptionButtonVariant = "binary" | "stacked";
export type ArticleVoteOptionButtonBinaryTone = "no" | "yes";

export interface ArticleVoteOptionButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  binaryTone?: ArticleVoteOptionButtonBinaryTone;
  iconSrc?: string;
  label: string;
  percent?: number;
  showResult?: boolean;
  state?: ArticleVoteOptionButtonState;
  variant?: ArticleVoteOptionButtonVariant;
}

export function ArticleVoteOptionButton({
  binaryTone,
  className,
  iconSrc,
  label,
  percent = 0,
  showResult = false,
  state = "default",
  style,
  type = "button",
  variant = "stacked",
  ...props
}: ArticleVoteOptionButtonProps) {
  const isActive = state === "active";
  const fillStyle = showResult
    ? ({ "--article-guide-result-size": `${percent}%` } as CSSProperties)
    : undefined;

  return (
    <button
      aria-pressed={isActive}
      className={cn("btn_articleGuideOption", className)}
      data-binary-tone={binaryTone}
      data-result-visible={showResult ? "true" : undefined}
      data-variant={variant}
      style={{ ...fillStyle, ...style }}
      type={type}
      {...props}
    >
      {variant === "binary" && iconSrc ? (
        <img
          alt=""
          className="icon_image img_articleGuideBinaryIcon"
          src={iconSrc}
        />
      ) : null}
      <span className="text_articleGuideOption">{label}</span>
      {showResult ? (
        <strong className="text_articleGuidePercent">{percent}%</strong>
      ) : null}
    </button>
  );
}
