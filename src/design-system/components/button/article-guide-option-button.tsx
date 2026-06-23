import type { ButtonHTMLAttributes, CSSProperties } from "react";

import { cn } from "../shared/utils";

export type ArticleGuideOptionButtonState = "active" | "default";
export type ArticleGuideOptionButtonVariant = "binary" | "stacked";
export type ArticleGuideOptionButtonBinaryTone = "no" | "yes";

export interface ArticleGuideOptionButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  binaryTone?: ArticleGuideOptionButtonBinaryTone;
  iconSrc?: string;
  label: string;
  percent?: number;
  showResult?: boolean;
  state?: ArticleGuideOptionButtonState;
  variant?: ArticleGuideOptionButtonVariant;
}

export function ArticleGuideOptionButton({
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
}: ArticleGuideOptionButtonProps) {
  const isActive = state === "active";
  const fillStyle = showResult
    ? ({ "--article-guide-result-size": `${percent}%` } as CSSProperties)
    : undefined;

  return (
    <button
      aria-pressed={isActive}
      className={cn(
        "btn_articleGuideOption",
        `btn_articleGuideOption_${variant}`,
        className,
      )}
      data-binary-tone={binaryTone}
      data-result-visible={showResult ? "true" : undefined}
      style={{ ...fillStyle, ...style }}
      type={type}
      {...props}
    >
      {variant === "binary" && iconSrc ? (
        <img
          alt=""
          className="newsroll_icon_image img_articleGuideBinaryIcon"
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
