import { ContentActionButton, Icon } from "@/design-system/components";

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
      className={tone === "light" ? "btn_moreAction" : undefined}
      onClick={onClick}
      tone={tone}
    >
      <span>{expanded ? expandedLabel : collapsedLabel}</span>
      {showIcon ? (
        <Icon className="icon_moreAction" name="chevron" />
      ) : null}
    </ContentActionButton>
  );
}
