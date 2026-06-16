import { IconButton } from "./icon-button";

type ArticleActionButtonsProps = {
  ariaLabel?: string;
  isBookmarked: boolean;
  onBookmark: () => void;
  onShare: () => void;
};

export function ArticleActionButtons({
  ariaLabel = "기사 도구",
  isBookmarked,
  onBookmark,
  onShare,
}: ArticleActionButtonsProps) {
  return (
    <div className="wrapper_articleActions" aria-label={ariaLabel} role="group">
      <IconButton
        baseClassName="btn_articleTool"
        icon="share"
        label="공유"
        onClick={onShare}
      />
      <IconButton
        aria-pressed={isBookmarked}
        baseClassName="btn_articleTool"
        icon="bookmark"
        label="북마크"
        onClick={onBookmark}
      />
    </div>
  );
}
