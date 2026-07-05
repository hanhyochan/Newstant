import {
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";

import {
  ChipLabel,
  DateTimeText,
  PillTabMenu,
  IconTextButton,
  NewsHeadlineRowButton as AllNewsHeadlineItem,
  TextButton,
} from "@/design-system/components";
import {
  getEnterFromRightMotionClassName,
  useSwipeTabNavigation,
} from "@/design-system/templates";
import { NewsCreatedTime } from "@/features/news/article/NewsCreatedTime";
import {
  commentReplyTemplates,
  type CommentReplyItem,
} from "@/features/news/comments/comment-model";
import { getVisibleReactionCount } from "@/features/news/article/article-reactions";
import type { AllNewsArticlePreview } from "@/features/news/all-news/all-news-model";
import {
  defaultNewsDateTime,
  type HomeArticle,
  type OpenArticleDetail,
} from "@/features/news/model";
import { type CommentId, type CommentItem } from "@/features/comments/utils/comment-data";
import { DataUnavailableMessage } from "@/features/shared/DataUnavailableMessage";
import { SeparatedList } from "@/features/shared/SeparatedList";

export type MyCommentKind = "all" | "comment" | "reply";

export type MyCommentSummaryItem = {
  article: HomeArticle;
  category: string;
  comment: CommentItem;
  commentKind: Exclude<MyCommentKind, "all">;
  headline: AllNewsArticlePreview & { category: string };
  targetCommentId: CommentId;
};

function MyCommentCreatedDate({
  children,
  dateTime = defaultNewsDateTime,
}: {
  children: ReactNode;
  dateTime?: string;
}) {
  return (
    <DateTimeText className="text_myCommentCreatedDate" dateTime={dateTime}>
      {children}
    </DateTimeText>
  );
}

function MyCommentPreviewThread({
  comment,
  instanceId,
  onOpenComment,
}: {
  comment: CommentItem;
  instanceId: string;
  onOpenComment: () => void;
}) {
  const replyToggleId = `${instanceId}-reply-toggle-${comment.id}`;
  const commentReplies: CommentReplyItem[] = Array.from(
    { length: Math.min(comment.replies, 3) },
    (_, replyIndex) => ({
      ...commentReplyTemplates[replyIndex % commentReplyTemplates.length],
      id: `${comment.id}-${replyIndex}`,
    }),
  );
  const likeCount = comment.likes;
  const dislikeCount = comment.dislikes;

  function openCommentFromControl(event: MouseEvent<HTMLElement>) {
    event.stopPropagation();
    onOpenComment();
  }

  function openCommentFromKeyboard(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    onOpenComment();
  }

  return (
    <article
      aria-label="댓글이 달린 기사 본문으로 이동"
      className="wrapper_commentItem wrapper_myPageCommentThread"
      id={`${instanceId}-comment-${comment.id}`}
      onClick={onOpenComment}
      onKeyDown={openCommentFromKeyboard}
      tabIndex={0}
    >
      <ChipLabel>{comment.choice}</ChipLabel>
      <p>{comment.body}</p>
      <footer>
        <TextButton
          id={replyToggleId}
          onClick={openCommentFromControl}
          type="button"
        >
          대댓글 {commentReplies.length}
        </TextButton>
        <span>
          <IconTextButton
            aria-label="댓글 좋아요"
            aria-pressed={false}
            icon="thumbUp"
            onClick={openCommentFromControl}
            tone="like"
            size="small"
          >
            {getVisibleReactionCount(likeCount)}
          </IconTextButton>
          <IconTextButton
            aria-label="댓글 싫어요"
            aria-pressed={false}
            icon="thumbDown"
            onClick={openCommentFromControl}
            tone="dislike"
            size="small"
          >
            {getVisibleReactionCount(dislikeCount)}
          </IconTextButton>
        </span>
      </footer>
    </article>
  );
}

export function MyCommentDetailPage({
  activeCategory,
  items,
  isLeaving = false,
  onCategoryChange,
  onOpenArticle,
  showTabs,
  tabs,
}: {
  activeCategory: string;
  items: MyCommentSummaryItem[];
  isLeaving?: boolean;
  onCategoryChange: (category: MyCommentKind) => void;
  onOpenArticle: OpenArticleDetail;
  showTabs: boolean;
  tabs: readonly { id: MyCommentKind; label: string }[];
}) {
  const firstTabId = tabs[0]?.id ?? "comment";
  const activeCommentKind = showTabs
    ? tabs.some((tab) => tab.id === activeCategory)
      ? (activeCategory as MyCommentKind)
      : firstTabId
    : "all";
  const visibleCommentItems =
    activeCommentKind === "all"
      ? items
      : items.filter((item) => item.commentKind === activeCommentKind);
  const {
    swipeMotionClassName: commentTabSwipeMotionClassName,
    ...commentTabSwipeHandlers
  } = useSwipeTabNavigation({
    disabled: !showTabs,
    items: tabs,
    onChange: onCategoryChange,
    value: activeCommentKind,
  });

  return (
    <div
      className={`container_myCommentPage ${getEnterFromRightMotionClassName(isLeaving)}`}
    >
      <h2 className="text_mySectionTitle">댓글</h2>
      <div
        className="wrapper_myTabbedDetailContent wrapper_panelContent"
        {...commentTabSwipeHandlers}
      >
      {showTabs ? (
        <PillTabMenu
          ariaLabel="내 댓글 카테고리"
          className="tab_myCategoryMenu wrapper_tabScroller"
          items={[...tabs]}
          onChange={(nextCategory) =>
            onCategoryChange(nextCategory as MyCommentKind)
          }
          value={activeCommentKind}
        />
      ) : null}
      <div className={`wrapper_myCommentList wrapper_scrollList ${commentTabSwipeMotionClassName}`.trim()}>
        {visibleCommentItems.length === 0 ? (
          <DataUnavailableMessage target="댓글" />
        ) : (
          <SeparatedList
            dividerClassName="divider_mySection"
            getKey={(item, index) => `${item.headline.title}-${index}`}
            items={visibleCommentItems}
            renderItem={(item, index) => (
              <div className="wrapper_myCommentItem">
                <MyCommentCreatedDate>{item.comment.date}</MyCommentCreatedDate>
                <AllNewsHeadlineItem
                  item={item.headline}
                  onClick={() => onOpenArticle(item.article)}
                />
                <MyCommentPreviewThread
                  comment={item.comment}
                  instanceId={`my-comment-detail-${index}`}
                  onOpenComment={() =>
                    onOpenArticle(item.article, { commentId: item.targetCommentId })
                  }
                />
              </div>
            )}
          />
        )}
      </div>
      </div>
    </div>
  );
}
