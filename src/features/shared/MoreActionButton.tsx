import { ContentActionButton } from "@/design-system/components";

export function MoreActionButton({
  ariaLabel,
  collapsedLabel = "더보기",
  expanded = false,
  expandedLabel = "접기",
  onClick,
  showIcon = true,
  tone = "light",
}: {
  ariaLabel?: string;
  collapsedLabel?: string;
  expanded?: boolean;
  expandedLabel?: string;
  onClick?: () => void;
  showIcon?: boolean;
  tone?: "dark" | "light";
}) {
  return (
    <ContentActionButton
      aria-label={ariaLabel}
      aria-expanded={showIcon ? expanded : undefined}
      className={tone === "light" ? "newsroll_all_more" : undefined}
      onClick={onClick}
      tone={tone}
    >
      <span>{expanded ? expandedLabel : collapsedLabel}</span>
      {showIcon ? (
        <img
          alt=""
          aria-hidden="true"
          className="newsroll_icon_image newsroll_all_more_icon"
          src="/icons/icon_chevron_right.svg"
        />
      ) : null}
    </ContentActionButton>
  );
}
