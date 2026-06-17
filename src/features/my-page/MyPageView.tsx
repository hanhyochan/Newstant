"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode
} from "react";

import {
  bookmarkApi,
  commentApi,
  newsApi,
  notificationApi,
  pollApi,
  settingsApi,
  userApi,
  welfareApi,
  type NotificationSettings,
  type UserNewsViewTime,
  type UserPreference
} from "@/app/_newsroll/api";
import { currentUserId } from "@/app/_newsroll/auth/current-user";
import { fixedDockedPanelProps } from "@/app/_newsroll/my-info-panel-behavior";
import {
  Button,
  ChipLabel,
  Icon,
  IconButton,
  NewsBlockItem,
  NewsRollDivider,
  NewsRollSwitch,
  PillTabMenu,
  ReactionButton,
  TextInput
} from "@/design-system/components";
import {
  NewsRollCommonLayout,
  NewsRollDetailBackButton,
  NewsRollDockedControls,
  NewsRollHeaderTop,
  NewsRollPagePanel,
  getEnterFromRightMotionClassName,
  newsrollHomeDockedScrollSelectors as homeDockedScrollSelectors,
  newsrollNewsFeedDetailSelector,
  newsrollPagePanelContentSelector as pagePanelContentSelector,
  newsrollPagePanelDockedGap as pagePanelDockedGap,
  newsrollPagePanelInitialGap as pagePanelInitialGap,
  newsrollPagePanelInitialTop as pagePanelInitialTop,
  useDetailScrollRestore,
  useEnterFromRightExitMotion
} from "@/design-system/templates";
import {
  getCommentItemFromApi,
  type CommentId,
  type CommentItem
} from "@/features/comments/utils/comment-data";
import { buildMyActivitySummary } from "@/features/my-page/utils/my-activity-summary";
import { PolicyDetailContent } from "@/features/policy/PolicyDetailContent";
import { DockedAlarmButton, NewsToolbar } from "@/features/shell/NewsRollToolbar";

import {
  AllNewsArticlePreview,
  AllNewsHeadlineItem,
  AllNewsMoreButton,
  AllNewsRelayItem,
  ArticleDetailContent,
  ArticleGuideOptionButton,
  ClientPortal,
  DataUnavailableMessage,
  NewsCreatedTime,
  SeparatedList,
  allNewsLatest,
  articleImage,
  binaryGuideOptions,
  commentReplyTemplates,
  createAllNewsArticle,
  defaultNewsDateLabel,
  defaultNewsDateTime,
  formatNewsDate,
  getAllNewsPreviewFromArticle,
  getHomeArticleFromNews,
  getVisibleReactionCount,
  guideOptions,
  homeArticle,
  homeArticles,
  type ArticleDetailOpenOptions,
  type BlockedKeywordSetting,
  type CommentReplyItem,
  type HomeArticle,
  type OpenArticleDetail,
  type PolicyItem,
  type QuickMenuRequest,
  type Tab
} from "@/features/news/NewsViews";

const myRecentNews = Array.from({ length: 12 }, (_, index) => ({
  dateTime: defaultNewsDateTime,
  image: articleImage,
  time: defaultNewsDateLabel,
  title:
    index % 2 === 0
      ? "용인 수지, 강남·분당 가격 동조화로..."
      : "APEC, 국익에 도움됐다 74%...",
}));
type MyRecentSummaryItem = (typeof myRecentNews)[number] & {
  article: HomeArticle;
};
const myRecentPreviewLimit = 10;

const myCategoryGroups = [
  {
    items: ["정치", "경제", "사회", "문화", "국제", "지역", "스포츠", "IT과학"],
    title: "나의 관심 카테고리 설정",
    active: new Set(["정치"]),
  },
  {
    items: ["미성년", "청년", "중장년", "노년"],
    title: "나의 연령대 설정",
    active: new Set(["청년"]),
  },
  {
    items: ["중앙일보", "국민일보", "한겨레"],
    title: "관심 언론사 설정",
    active: new Set(["중앙일보", "국민일보", "한겨레"]),
  },
];

function getMyCategoryOptionId(groupIndex: number, itemIndex: number) {
  return `${groupIndex}-${itemIndex}`;
}

function getMyCategoryTabItems(groupIndex: number) {
  return myCategoryGroups[groupIndex].items.map((item, itemIndex) => ({
    id: getMyCategoryOptionId(groupIndex, itemIndex),
    label: item,
  }));
}

function getInitialCategorySettings() {
  return myCategoryGroups.map(
    (group, groupIndex) =>
      new Set(
        group.items
          .map((item, itemIndex) =>
            group.active.has(item)
              ? getMyCategoryOptionId(groupIndex, itemIndex)
              : null,
          )
          .filter((item): item is string => Boolean(item)),
      ),
  );
}
function getCategorySettingsFromPreference(preference: UserPreference | null) {
  const initialSettings = getInitialCategorySettings();

  if (!preference) {
    return initialSettings;
  }

  const getValidOptionIds = (groupIndex: number, optionIds: string[]) => {
    const validIds = new Set(getMyCategoryTabItems(groupIndex).map((item) => item.id));
    return optionIds.filter((optionId) => validIds.has(optionId));
  };

  const categoryIds = getValidOptionIds(0, preference.categoryIds);
  const ageGroupIds = getValidOptionIds(1, preference.ageGroupId ? [preference.ageGroupId] : []);
  const pressIds = getValidOptionIds(2, preference.pressIds);

  return [
    new Set(categoryIds.length > 0 ? categoryIds : initialSettings[0]),
    new Set(ageGroupIds.length > 0 ? ageGroupIds : initialSettings[1]),
    new Set(pressIds.length > 0 ? pressIds : initialSettings[2]),
  ];
}

function getNotificationSettingsFromApi(settings: NotificationSettings | null) {
  return {
    "속보": settings?.breakingNews ?? true,
    "내 댓글에 좋아요, 답글": settings?.commentReplies ?? true,
    "공지사항": settings?.notices ?? true,
  };
}

function getNewsViewTimesFromApi(settings: UserNewsViewTime | null) {
  return new Set(settings?.times?.length ? settings.times : ["07:00", "21:00"]);
}const mySummaryItems = [
  { count: 56, icon: "bookmark", label: "북마크", tone: "like", value: "bookmark" },
  { count: 54, icon: "vote", label: "투표", tone: "dislike", value: "vote" },
  { count: 15, icon: "chat", label: "댓글", tone: "neutral", value: "comment" },
] as const;
const myNotificationLabels = ["속보", "내 댓글에 좋아요, 답글", "공지사항"] as const;
type MySummaryView = (typeof mySummaryItems)[number]["value"];
type MyPageDetailView =
  | "recent"
  | "customNewsSettings"
  | "newsViewTime"
  | "profileSettings"
  | MySummaryView
  | null;

function BlockedKeywordDialog({
  onCancel,
  onInputChange,
  onSave,
  value,
}: {
  onCancel: () => void;
  onInputChange: (value: string) => void;
  onSave: () => void;
  value: string;
}) {
  useEffect(() => {
    function closeOnEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [onCancel]);

  return (
    <ClientPortal>
      <div
        className="container_myKeywordOverlay"
        onClick={onCancel}
        role="presentation"
      >
        <section
          aria-labelledby="my-blocked-keyword-dialog-title"
          aria-modal="true"
          className="container_myKeywordDialog"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
        >
          <h2
            className="text_myKeywordDialogTitle"
            id="my-blocked-keyword-dialog-title"
          >
            가리고 싶은 키워드
          </h2>
          <form
            className="form_myKeywordDialog"
            onSubmit={(event) => {
              event.preventDefault();
              onSave();
            }}
          >
            <div className="wrapper_myKeywordInput">
              <TextInput
                aria-label="가리고 싶은 키워드 입력"
                onChange={(event) => onInputChange(event.target.value)}
                placeholder="키워드를 입력해주세요"
                inputSize="large"
                radius="rounded"
                type="text"
                value={value}
                variant="outline"
                wrapperClassName="input_commentComposer"
              />
            </div>
            <div className="wrapper_commentEditActions">
              <Button
                className="btn_commentEditSave"
                radius="rounded"
                size="large"
                type="submit"
                variant="filled"
              >
                저장
              </Button>
              <Button
                className="btn_commentEditCancel"
                onClick={onCancel}
                radius="rounded"
                size="large"
                type="button"
                variant="filled"
              >
                취소
              </Button>
            </div>
          </form>
        </section>
      </div>
    </ClientPortal>
  );
}

function BlockedKeywordSettingsSection({
  blockedKeywordSettings,
  inputValue,
  isDialogOpen,
  onCancelDialog,
  onInputChange,
  onKeywordDelete,
  onKeywordToggle,
  onOpenDialog,
  onSaveKeyword,
}: {
  blockedKeywordSettings: BlockedKeywordSetting[];
  inputValue: string;
  isDialogOpen: boolean;
  onCancelDialog: () => void;
  onInputChange: (value: string) => void;
  onKeywordDelete: (keyword: string) => void;
  onKeywordToggle: (keyword: string) => void;
  onOpenDialog: () => void;
  onSaveKeyword: () => void;
}) {
  const keywordTabs = blockedKeywordSettings.map((setting) => ({
    id: setting.keyword,
    label: setting.keyword,
  }));

  return (
    <section
      aria-label="가리고 싶은 키워드 설정"
      className="container_myBlockedKeywordSection"
    >
      <h2 className="text_mySectionTitle">가리고 싶은 키워드</h2>
      <p className="text_myBlockedKeywordDescription">
        맞춤 뉴스, 전체 뉴스에 모두 적용되며 해당 키워드를 가진 뉴스는 검색되지 않습니다.
      </p>
      <div
        aria-label="등록된 가리고 싶은 키워드"
        className="wrapper_myBlockedKeywordChips"
        role="group"
      >
        <div className="wrapper_myBlockedKeywordTabs">
          {keywordTabs.length > 0 ? (
            <PillTabMenu
              ariaLabel="가리고 싶은 키워드"
              className="tab_myCategoryMenu tab_myBlockedKeywordMenu"
              getItemState={(keyword) =>
                blockedKeywordSettings.find((setting) => setting.keyword === keyword)?.isActive
                  ? "active"
                  : "default"
              }
              getItemWrapperClassName={() => "wrapper_myBlockedKeywordTab"}
              items={keywordTabs}
              keyboardNavigation={false}
              onChange={onKeywordToggle}
              renderItemAddon={(item, state) =>
                state === "default" ? (
                  <button
                    aria-label={`${item.label} 키워드 삭제`}
                    className="btn_myBlockedKeywordDelete"
                    onClick={() => onKeywordDelete(item.id)}
                    type="button"
                  >
                    <span aria-hidden="true" />
                  </button>
                ) : null
              }
              role="group"
              value={keywordTabs[0]?.id ?? ""}
            />
          ) : null}
        </div>
        <button
          aria-label="가리고 싶은 키워드 추가"
          className="btn_myBlockedKeywordAdd"
          onClick={onOpenDialog}
          type="button"
        >
          <Icon name="plus" />
        </button>
      </div>
      {isDialogOpen ? (
        <BlockedKeywordDialog
          onCancel={onCancelDialog}
          onInputChange={onInputChange}
          onSave={onSaveKeyword}
          value={inputValue}
        />
      ) : null}
    </section>
  );
}

const mySummaryAllTabLabel = "전체";const myVotePercents = [64, 48, 72, 57, 81];
const myCommentTabs = [
  { id: "all", label: "전체" },
  { id: "comment", label: "댓글" },
  { id: "reply", label: "대댓글" },
] as const;

function getUniqueValues<T extends string>(items: T[]) {
  return Array.from(new Set(items));
}

function getMySummaryCategoryTabs(items: { category: string }[]) {
  return [
    mySummaryAllTabLabel,
    ...getUniqueValues(items.map((item) => item.category)),
  ];
}

function isMySummaryAllCategory(category: string) {
  return category === mySummaryAllTabLabel;
}

function getMySummaryItemsByCategory<T extends { category: string }>(
  items: T[],
  category: string,
) {
  return isMySummaryAllCategory(category)
    ? items
    : items.filter((item) => item.category === category);
}

const myVoteItems = allNewsLatest.map((item, index) => ({
  article: createAllNewsArticle(item, item.category, index),
  category: item.category,
  headline: item,
  isBinary: false,
  percent: myVotePercents[index % myVotePercents.length],
  pollTitle: item.title,
  selectedOption: guideOptions[index % guideOptions.length],
  title: item.title,
}));
const myVoteCategoryTabs = getMySummaryCategoryTabs(myVoteItems);
const myBookmarkTabs = ["뉴스", "국가정책"] as const;
type MyBookmarkNewsSummaryItem = AllNewsArticlePreview & {
  bookmarkType: "news";
  category: typeof myBookmarkTabs[0];
  newsCategory: string;
};
type MyBookmarkPolicySummaryItem = {
  bookmarkType: "policy";
  category: typeof myBookmarkTabs[1];
  policy: PolicyItem;
  summary: string;
  tags: string[];
  title: string;
};
type MyBookmarkSummaryItem =
  | MyBookmarkNewsSummaryItem
  | MyBookmarkPolicySummaryItem;
type MyCommentKind = (typeof myCommentTabs)[number]["id"];
type MyVoteSummaryItem = {
  article: HomeArticle;
  category: string;
  headline: AllNewsArticlePreview & { category: string };
  isBinary: boolean;
  percent: number;
  pollTitle: string;
  selectedOption: string;
  title: string;
};type MyCommentSummaryItem = {
  article: HomeArticle;
  category: string;
  comment: CommentItem;
  commentKind: Exclude<MyCommentKind, "all">;
  headline: AllNewsArticlePreview & { category: string };
  targetCommentId: CommentId;
};

function hasMultipleMySummaryCategories(items: { category: string }[]) {
  return getUniqueValues(items.map((item) => item.category)).length > 1;
}

function hasMultipleMyCommentKinds(items: { commentKind: Exclude<MyCommentKind, "all"> }[]) {
  return getUniqueValues(items.map((item) => item.commentKind)).length > 1;
}

function formatPolicyBookmarkDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getPolicyBookmarkItem(policy: {
  applicationEndDate: string;
  applicationMethod: string;
  applicationStartDate: string;
  businessEndDate: string;
  businessStartDate: string;
  category: string;
  documents: string;
  institution: string;
  label: string;
  registeredAt: string;
  selectionMethod: string;
  subcategory: string;
  summary: string;
  supportContent: string;
  targetAge: string;
  title: string;
  updatedAt: string;
}): PolicyItem {
  return {
    details: [
      { label: "지원 대상 연령", value: policy.targetAge },
      { label: "지원 내용", value: policy.supportContent },
      { label: "지원 기관", value: policy.institution },
      {
        label: "사업 기간",
        value: `${policy.businessStartDate} ~ ${policy.businessEndDate}`,
      },
      {
        label: "신청 기간",
        value: `${policy.applicationStartDate} ~ ${policy.applicationEndDate}`,
      },
      { label: "신청 방법", value: policy.applicationMethod },
      { label: "선발 방식", value: policy.selectionMethod },
      { label: "제출 서류", value: policy.documents },
    ],
    registeredAt: formatPolicyBookmarkDate(policy.registeredAt),
    summary: policy.summary,
    tags: [policy.category, policy.subcategory, policy.label],
    title: policy.title,
    updatedAt: formatPolicyBookmarkDate(policy.updatedAt),
  };
}

type MySettingRowProps = {
  checked?: boolean;
  label: string;
  onClick?: () => void;
  showChevron?: boolean;
};

function MySettingRow({
  checked,
  label,
  onClick,
  showChevron = false,
}: MySettingRowProps) {
  const className = `btn_mySettingRow${showChevron ? " btn_mySettingRowLink" : ""}`;

  return (
    <button
      aria-pressed={checked}
      className={className}
      onClick={onClick}
      type="button"
    >
      <span className="text_mySettingLabel">{label}</span>
      {typeof checked === "boolean" ? <NewsRollSwitch checked={checked} /> : null}
      {showChevron ? <span className="icon_myChevron" aria-hidden="true" /> : null}
    </button>
  );
}

function createMyRecentArticle(
  item: MyRecentSummaryItem,
  index: number,
): HomeArticle {
  const fallbackArticle = homeArticles[index % homeArticles.length] ?? homeArticle;

  return {
    ...fallbackArticle,
    ...item.article,
    date: item.time,
    image: item.image,
    imageAlt: item.article.imageAlt,
    title: item.title,
  };
}

function MyRecentDetailPage({
  items,
  isLeaving = false,
  onOpenArticle,
}: {
  items: MyRecentSummaryItem[];
  isLeaving?: boolean;
  onOpenArticle: OpenArticleDetail;
}) {
  return (
    <div
      className={`container_myBookmarkPage ${getEnterFromRightMotionClassName(isLeaving)}`}
    >
      <h2 className="text_mySectionTitle">최근 본 뉴스</h2>
      {items.length === 0 ? (
        <DataUnavailableMessage target="최근 본 뉴스" />
      ) : (
        <SeparatedList
          dividerClassName="newsroll_all_itemDivider"
          getKey={(item, index) => `${item.title}-${index}`}
          items={items}
          renderItem={(item, index) => (
            <AllNewsRelayItem
              featured={index === 0 || index === 5}
              item={item}
              onClick={() => onOpenArticle(createMyRecentArticle(item, index))}
            />
          )}
        />
      )}
    </div>
  );
}

function MyBookmarkDetailPage({
  activeCategory,
  items,
  isLeaving = false,
  onCategoryChange,
  onOpenArticle,
  onOpenPolicy,
  showTabs,
  tabs,
}: {
  activeCategory: string;
  items: MyBookmarkSummaryItem[];
  isLeaving?: boolean;
  onCategoryChange: (category: string) => void;
  onOpenArticle: OpenArticleDetail;
  onOpenPolicy: (policy: PolicyItem) => void;
  showTabs: boolean;
  tabs: string[];
}) {
  const visibleBookmarkItems = getMySummaryItemsByCategory(
    items,
    activeCategory,
  );

  return (
    <div
      className={`container_myBookmarkPage ${getEnterFromRightMotionClassName(isLeaving)}`}
    >
      <h2 className="text_mySectionTitle">북마크</h2>
      {showTabs ? (
        <PillTabMenu
          ariaLabel="북마크 뉴스 카테고리"
          className="tab_myCategoryMenu"
          items={tabs.map((category) => ({
            id: category,
            label: category,
          }))}
          onChange={onCategoryChange}
          value={activeCategory}
        />
      ) : null}
      {visibleBookmarkItems.length === 0 ? (
        <DataUnavailableMessage target="북마크" />
      ) : (
        <SeparatedList
          dividerClassName="newsroll_all_itemDivider"
          getKey={(item, index) => `${item.title}-${index}`}
          items={visibleBookmarkItems}
          renderItem={(item, index) => (
            item.bookmarkType === "news" ? (
              <AllNewsRelayItem
                featured={index === 0 || index === 5}
                item={item}
                onClick={() =>
                  onOpenArticle(
                    createAllNewsArticle(item, item.newsCategory, index),
                  )
                }
              />
            ) : (
              <button
                className="newsroll_policy_list_item"
                onClick={() => onOpenPolicy(item.policy)}
                type="button"
              >
                <div className="newsroll_policy_list_tags">
                  {item.tags.map((tag, tagIndex) => (
                    <ChipLabel
                      kind={tagIndex === item.tags.length - 1 ? "policyAccent" : "policy"}
                      key={`${item.title}-${tag}`}
                    >
                      {tag}
                    </ChipLabel>
                  ))}
                </div>
                <div className="wrapper_policyItemContent">
                  <h2>{item.title}</h2>
                  <p className="text_infoBody text_lineClamp2">{item.summary}</p>
                </div>
              </button>
            )
          )}
        />
      )}
    </div>
  );
}

function MyVoteDetailPage({
  activeCategory,
  items,
  isLeaving = false,
  onCategoryChange,
  onOpenArticle,
  showTabs,
  tabs,
}: {
  activeCategory: string;
  items: MyVoteSummaryItem[];
  isLeaving?: boolean;
  onCategoryChange: (category: string) => void;
  onOpenArticle: OpenArticleDetail;
  showTabs: boolean;
  tabs: string[];
}) {
  const visibleVoteItems = getMySummaryItemsByCategory(
    items,
    activeCategory,
  );

  return (
    <div
      className={`container_myVotePage ${getEnterFromRightMotionClassName(isLeaving)}`}
    >
      <h2 className="text_mySectionTitle">투표</h2>
      {showTabs ? (
        <PillTabMenu
          ariaLabel="내가 참여한 투표 카테고리"
          className="tab_myCategoryMenu"
          items={tabs.map((category) => ({
            id: category,
            label: category,
          }))}
          onChange={onCategoryChange}
          value={activeCategory}
        />
      ) : null}
      <div className="wrapper_myVoteList">
        {visibleVoteItems.length === 0 ? (
          <DataUnavailableMessage target="투표" />
        ) : (
          <SeparatedList
            dividerClassName="divider_mySection"
            getKey={(item, index) => `${item.title}-${index}`}
            items={visibleVoteItems}
            renderItem={(item) => (
              <article className="wrapper_myVoteItem">
                <AllNewsHeadlineItem
                  item={item.headline}
                  onClick={() =>
                    onOpenArticle(item.article, { scrollTarget: "poll" })
                  }
                />
                <strong className="text_myVoteQuestion">{item.pollTitle}</strong>
                <ArticleGuideOptionButton
                  isSelected
                  label={item.selectedOption}
                  onClick={() =>
                    onOpenArticle(item.article, { scrollTarget: "poll" })
                  }
                  percent={item.percent}
                  showResult
                  variant={item.isBinary ? "binary" : "stacked"}
                />
              </article>
            )}
          />
        )}
      </div>
    </div>
  );
}

function MyCommentCreatedDate({
  children,
  dateTime = defaultNewsDateTime,
}: {
  children: ReactNode;
  dateTime?: string;
}) {
  return (
    <time className="text_myCommentCreatedDate" dateTime={dateTime}>
      {children}
    </time>
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
  const replyListId = `${instanceId}-reply-list-${comment.id}`;
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
      <ChipLabel kind="commentChoice">{comment.choice}</ChipLabel>
      <p>{comment.body}</p>
      <footer>
        <button
          aria-controls={replyListId}
          aria-expanded={false}
          className="btn_textAction"
          id={replyToggleId}
          onClick={openCommentFromControl}
          type="button"
        >
          대댓글 {commentReplies.length}
        </button>
        <span>
          <ReactionButton
            aria-label="댓글 좋아요"
            aria-pressed={false}
            icon="thumbUp"
            onClick={openCommentFromControl}
            tone="like"
            variant="comment"
          >
            {getVisibleReactionCount(likeCount)}
          </ReactionButton>
          <ReactionButton
            aria-label="댓글 싫어요"
            aria-pressed={false}
            icon="thumbDown"
            onClick={openCommentFromControl}
            tone="dislike"
            variant="comment"
          >
            {getVisibleReactionCount(dislikeCount)}
          </ReactionButton>
        </span>
      </footer>
      <div
        aria-hidden="true"
        aria-labelledby={replyToggleId}
        className="wrapper_commentReplies"
        id={replyListId}
        role="region"
      >
        <div className="wrapper_commentRepliesInner">
          <Button
            aria-controls={`${instanceId}-composer`}
            aria-pressed={false}
            className="btn_textAction"
            classNameOnly
            onClick={openCommentFromControl}
            type="button"
          >
            대댓글 달기
          </Button>
          {commentReplies.map((reply, replyIndex) => (
            <Fragment key={reply.id}>
              <article
                className="wrapper_commentReplyItem"
                id={`${instanceId}-reply-${reply.id}`}
              >
                <header>
                  <span className="wrapper_commentMeta">
                    <strong>{reply.author}</strong>
                    <NewsCreatedTime>{reply.date}</NewsCreatedTime>
                  </span>
                  <span className="wrapper_commentAction">
                    <IconButton
                      aria-expanded={false}
                      aria-haspopup="menu"
                      baseClassName="btn_commentAction"
                      disabled
                      icon="detail"
                      label="대댓글 더보기"
                    />
                  </span>
                </header>
                <ChipLabel kind="commentChoice">{reply.choice}</ChipLabel>
                <p>{reply.body}</p>
                <footer>
                  <span>
                    <ReactionButton
                      aria-label="대댓글 좋아요"
                      disabled
                      icon="thumbUp"
                      tone="like"
                      variant="comment"
                    >
                      {getVisibleReactionCount(reply.likes)}
                    </ReactionButton>
                    <ReactionButton
                      aria-label="대댓글 싫어요"
                      disabled
                      icon="thumbDown"
                      tone="dislike"
                      variant="comment"
                    >
                      {getVisibleReactionCount(reply.dislikes)}
                    </ReactionButton>
                  </span>
                </footer>
              </article>
              {replyIndex < commentReplies.length - 1 ? (
                <span aria-hidden="true" className="divider_commentItem" />
              ) : null}
            </Fragment>
          ))}
        </div>
      </div>
    </article>
  );
}

function MyCommentDetailPage({
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
  const activeCommentKind = myCommentTabs.some(
    (tab) => tab.id === activeCategory,
  )
    ? (activeCategory as MyCommentKind)
    : "all";
  const visibleCommentItems =
    activeCommentKind === "all"
      ? items
      : items.filter((item) => item.commentKind === activeCommentKind);

  return (
    <div
      className={`container_myCommentPage ${getEnterFromRightMotionClassName(isLeaving)}`}
    >
      <h2 className="text_mySectionTitle">댓글</h2>
      {showTabs ? (
        <PillTabMenu
          ariaLabel="내 댓글 카테고리"
          className="tab_myCategoryMenu"
          items={[...tabs]}
          onChange={(nextCategory) =>
            onCategoryChange(nextCategory as MyCommentKind)
          }
          value={activeCommentKind}
        />
      ) : null}
      <div className="wrapper_myCommentList">
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
  );
}

const myNewsViewTimeSections = [
  {
    label: "아침",
    times: ["06:00", "07:00", "08:00", "09:00"],
  },
  {
    label: "점심",
    times: ["11:00", "12:00", "13:00", "14:00"],
  },
  {
    label: "저녁",
    times: ["16:00", "17:00", "18:00", "19:00"],
  },
  {
    label: "밤",
    times: ["21:00", "22:00", "23:00"],
  },
] as const;

const myProfileSettingSections = [
  {
    title: "계정",
    items: ["내 정보 수정", "비밀번호 찾기 / 재설정"],
  },
  {
    title: "동의 및 약관",
    items: [
      "약관 동의",
      "개인정보 처리방침",
      "서비스 이용약관",
      "개인정보 수집·이용 동의",
      "마케팅/알림 수신 동의",
    ],
  },
  {
    title: "활동 관리",
    items: ["문의 내역", "신고 내역", "차단/숨김 설정"],
  },
  {
    title: "NewsRoll",
    items: [
      "앱 정보",
      "오픈소스 라이선스",
      "개인정보 처리방침 변경 이력",
      "서비스 약관 변경 이력",
    ],
  },
] as const;

export function MyPageView({
  blockedKeywordSettings,
  isDarkMode,
  isTextLarge,
  onAddBlockedKeyword,
  onDarkModeChange,
  onDeleteBlockedKeyword,
  onToggleBlockedKeyword,
  onOpenBreakingNews,
  onOpenMenu,
  onOpenSearch,
  onQuickMenuBack,
  onToggleTextSize,
  quickMenuRequest,
}: {
  blockedKeywordSettings: BlockedKeywordSetting[];
  isDarkMode: boolean;
  isTextLarge: boolean;
  onAddBlockedKeyword: (keyword: string) => void;
  onDarkModeChange: (isDarkMode: boolean) => void;
  onDeleteBlockedKeyword: (keyword: string) => void;
  onToggleBlockedKeyword: (keyword: string) => void;
  onOpenBreakingNews: () => void;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  onQuickMenuBack: (returnView: Tab) => void;
  onToggleTextSize: () => void;
  quickMenuRequest?: QuickMenuRequest | null;
}) {
  const [activeDetailView, setActiveDetailView] =
    useState<MyPageDetailView>(null);
  const [myArticleDetail, setMyArticleDetail] = useState<{
    article: HomeArticle;
    commentId?: CommentId;
    replyToCommentId?: CommentId;
    scrollTarget?: ArticleDetailOpenOptions["scrollTarget"];
  } | null>(null);
  const [myPolicyDetail, setMyPolicyDetail] = useState<PolicyItem | null>(null);
  const [activeVoteCategory, setActiveVoteCategory] = useState(
    () => myVoteCategoryTabs[0] ?? "",
  );
  const [activeBookmarkCategory, setActiveBookmarkCategory] = useState<string>(
    () => myBookmarkTabs[0],
  );
  const [activeCommentCategory, setActiveCommentCategory] = useState<MyCommentKind>(
    () => "all",
  );
  const [myDynamicCommentItems, setMyDynamicCommentItems] = useState<
    MyCommentSummaryItem[]
  >([]);
  const [myDynamicBookmarkItems, setMyDynamicBookmarkItems] = useState<
    MyBookmarkSummaryItem[]
  >([]);
  const [myDynamicVoteItems, setMyDynamicVoteItems] = useState<
    MyVoteSummaryItem[]
  >([]);
  const [myDynamicRecentItems, setMyDynamicRecentItems] = useState<
    MyRecentSummaryItem[]
  >([]);
  const [myBookmarkCount, setMyBookmarkCount] = useState(0);
  const [myVoteCount, setMyVoteCount] = useState(0);
  const [selectedCategorySettings, setSelectedCategorySettings] = useState(
    getInitialCategorySettings,
  );
  const [notificationSettings, setNotificationSettings] = useState<
    Record<string, boolean>
  >({
    "내 댓글에 좋아요, 답글": true,
    공지사항: true,
    속보: true,
  });
  const [selectedNewsViewTimes, setSelectedNewsViewTimes] = useState(
    () => new Set(["07:00", "21:00"]),
  );
  const userPreferenceIdRef = useRef<string | null>(null);
  const notificationSettingsIdRef = useRef<string | null>(null);
  const userNewsViewTimeIdRef = useRef<string | null>(null);
  const lastQuickMenuRequestIdRef = useRef<number | null>(null);
  const [isBlockedKeywordDialogOpen, setIsBlockedKeywordDialogOpen] =
    useState(false);
  const [blockedKeywordInputValue, setBlockedKeywordInputValue] = useState("");
  const myPanelContentRef = useRef<HTMLDivElement>(null);
  const isRecentOpen = activeDetailView === "recent";
  const isCustomNewsSettingsOpen = activeDetailView === "customNewsSettings";
  const isNewsViewTimeOpen = activeDetailView === "newsViewTime";
  const isProfileSettingsOpen = activeDetailView === "profileSettings";
  const isBookmarkOpen = activeDetailView === "bookmark";
  const isVoteOpen = activeDetailView === "vote";
  const isCommentOpen = activeDetailView === "comment";
  const isMyArticleDetailOpen = myArticleDetail !== null;
  const isMyNestedDetailOpen = isMyArticleDetailOpen || myPolicyDetail !== null;
  const dynamicCommentCategoryTabs = useMemo(
    () => myCommentTabs,
    [],
  );
  const dynamicBookmarkCategoryTabs = useMemo(
    () => [...myBookmarkTabs],
    [],
  );
  const dynamicVoteCategoryTabs = useMemo(
    () => getMySummaryCategoryTabs(myDynamicVoteItems),
    [myDynamicVoteItems],
  );
  const shouldShowBookmarkCategoryTabs = useMemo(
    () => true,
    [],
  );
  const shouldShowVoteCategoryTabs = useMemo(
    () => hasMultipleMySummaryCategories(myDynamicVoteItems),
    [myDynamicVoteItems],
  );
  const shouldShowCommentKindTabs = useMemo(
    () => hasMultipleMyCommentKinds(myDynamicCommentItems),
    [myDynamicCommentItems],
  );
  const myActivityCounts = useMemo(
    () =>
      Object.fromEntries(
        mySummaryItems.map((item) => [
          item.value,
          item.value === "comment"
            ? myDynamicCommentItems.length
            : item.value === "bookmark"
              ? myBookmarkCount
              : item.value === "vote"
                ? myVoteCount
                : 0,
        ]),
      ) as Record<MySummaryView, number>,
    [myBookmarkCount, myDynamicCommentItems.length, myVoteCount],
  );
  const activeSummary: MySummaryView | null =
    isBookmarkOpen || isVoteOpen || isCommentOpen ? activeDetailView : null;
  const isMyDetailOpen = activeDetailView !== null;
  const myDetailScrollRestore = useDetailScrollRestore({
    isDetailOpen: isMyDetailOpen,
    scrollerRef: myPanelContentRef,
  });
  const myArticleDetailScrollRestore = useDetailScrollRestore({
    isDetailOpen: isMyNestedDetailOpen,
    scrollerRef: myPanelContentRef,
  });
  const closeMyArticleDetailImmediately = useCallback(() => {
    myArticleDetailScrollRestore.requestRestore();
    setMyArticleDetail(null);
    setMyPolicyDetail(null);
  }, [myArticleDetailScrollRestore]);
  const closeActiveDetailViewImmediately = useCallback(() => {
    myDetailScrollRestore.requestRestore();
    setMyArticleDetail(null);
    setMyPolicyDetail(null);
    setActiveDetailView(null);
  }, [myDetailScrollRestore]);
  const myArticleDetailExitMotion = useEnterFromRightExitMotion({
    isOpen: isMyNestedDetailOpen,
    onClose: closeMyArticleDetailImmediately,
  });
  const myDetailExitMotion = useEnterFromRightExitMotion({
    isOpen: isMyDetailOpen && !isMyNestedDetailOpen,
    onClose: closeActiveDetailViewImmediately,
  });

  useEffect(() => {
    let ignore = false;

    async function loadMyActivity() {
      const [
        nextComments,
        allComments,
        allCommentReactions,
        nextNews,
        nextBookmarks,
        nextUserVotes,
        nextPolls,
        nextPollOptions,
        nextPollVotes,
        nextRecentViews,
        nextPolicies,
      ] = await Promise.all([
        commentApi.getCommentsByUserId(currentUserId),
        commentApi.getComments(),
        commentApi.getCommentReactions(),
        newsApi.getNewsList(),
        bookmarkApi.getBookmarks(currentUserId),
        pollApi.getPollVotesByUserId(currentUserId),
        pollApi.getPolls(),
        pollApi.getPollOptions(),
        pollApi.getPollVotes(),
        newsApi.getRecentNewsViews(currentUserId),
        welfareApi.getWelfarePolicyList("all"),
      ]);
      const {
        bookmarkItems: nextBookmarkItems,
        commentItems: nextItems,
        recentItems: nextRecentItems,
        voteItems: nextVoteItems,
      } = buildMyActivitySummary({
        allCommentReactions,
        allComments,
        binaryGuideOptions,
        bookmarks: nextBookmarks,
        comments: nextComments,
        formatNewsDate,
        getArticleFromNews: getHomeArticleFromNews,
        getCommentItem: getCommentItemFromApi,
        getHeadlineFromArticle: getAllNewsPreviewFromArticle,
        guideOptions,
        news: nextNews,
        polls: nextPolls,
        pollOptions: nextPollOptions,
        pollVotes: nextPollVotes,
        recentViews: nextRecentViews,
        userVotes: nextUserVotes,
      });
      const policyById = new Map(nextPolicies.map((policy) => [policy.id, policy]));
      const nextNewsBookmarkItems: MyBookmarkNewsSummaryItem[] =
        nextBookmarkItems.map((item) => ({
          ...item,
          bookmarkType: "news",
          category: myBookmarkTabs[0],
          newsCategory: item.category,
        }));
      const nextPolicyBookmarkItems: MyBookmarkPolicySummaryItem[] =
        nextBookmarks
          .filter((bookmark) => bookmark.targetType === "welfarePolicy")
          .map((bookmark) => {
            const policy = policyById.get(bookmark.targetId);

            if (!policy) {
              return null;
            }

            const policyItem = getPolicyBookmarkItem(policy);

            return {
              bookmarkType: "policy" as const,
              category: myBookmarkTabs[1],
              policy: policyItem,
              summary: policyItem.summary,
              tags: policyItem.tags,
              title: policyItem.title,
            };
          })
          .filter((item): item is MyBookmarkPolicySummaryItem => Boolean(item));
      const nextAllBookmarkItems = [
        ...nextNewsBookmarkItems,
        ...nextPolicyBookmarkItems,
      ];

      if (!ignore) {
        setMyDynamicCommentItems(nextItems);
        setMyDynamicBookmarkItems(nextAllBookmarkItems);
        setMyDynamicRecentItems(nextRecentItems);
        setMyDynamicVoteItems(nextVoteItems);
        setMyBookmarkCount(nextAllBookmarkItems.length);
        setMyVoteCount(nextVoteItems.length);
        setActiveCommentCategory("all");
        setActiveBookmarkCategory(myBookmarkTabs[0]);
        if (nextVoteItems.length > 0) {
          setActiveVoteCategory(getMySummaryCategoryTabs(nextVoteItems)[0] ?? "");
        }
      }
    }

    loadMyActivity().catch(() => {
      if (!ignore) {
        setMyDynamicCommentItems([]);
        setMyDynamicBookmarkItems([]);
        setMyDynamicRecentItems([]);
        setMyDynamicVoteItems([]);
        setMyBookmarkCount(0);
        setMyVoteCount(0);
      }
    });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadMySettings() {
      const [preference, notifications, newsViewTimes] = await Promise.all([
        userApi.getUserPreferences(currentUserId),
        notificationApi.getNotificationSettings(currentUserId),
        settingsApi.getUserNewsViewTimes(currentUserId),
      ]);
      const currentPreference = preference[0] ?? null;

      if (ignore) {
        return;
      }

      userPreferenceIdRef.current = currentPreference?.id ?? null;
      notificationSettingsIdRef.current = notifications?.id ?? null;
      userNewsViewTimeIdRef.current = newsViewTimes?.id ?? null;
      setSelectedCategorySettings(getCategorySettingsFromPreference(currentPreference));
      setNotificationSettings(getNotificationSettingsFromApi(notifications));
      setSelectedNewsViewTimes(getNewsViewTimesFromApi(newsViewTimes));
      onDarkModeChange(notifications?.darkMode ?? false);
    }

    loadMySettings().catch(() => undefined);

    return () => {
      ignore = true;
    };
  }, [onDarkModeChange]);

  useEffect(() => {
    if (!quickMenuRequest || lastQuickMenuRequestIdRef.current === quickMenuRequest.id) {
      return;
    }

    lastQuickMenuRequestIdRef.current = quickMenuRequest.id;

    if (quickMenuRequest.target === "customNewsSettings") {
      setMyArticleDetail(null);
      setMyPolicyDetail(null);
      setActiveDetailView("customNewsSettings");
      return;
    }

    if (quickMenuRequest.target === "profileSettings") {
      setMyArticleDetail(null);
      setMyPolicyDetail(null);
      setActiveDetailView("profileSettings");
      return;
    }

    setMyArticleDetail(null);
    setMyPolicyDetail(null);
    setActiveDetailView(null);
    window.requestAnimationFrame(() => {
      const target = myPanelContentRef.current?.querySelector<HTMLElement>(
        "[data-my-section='notification-settings']",
      );

      target?.scrollIntoView({ block: "start" });
    });
  }, [quickMenuRequest]);

  const saveUserPreference = (
    nextSettings: Array<Set<string>>,
  ) => {
    const preferenceId = userPreferenceIdRef.current;

    if (!preferenceId) {
      return;
    }

    userApi
      .updateUserPreferences(preferenceId, {
        categoryIds: Array.from(nextSettings[0] ?? []),
        ageGroupId: Array.from(nextSettings[1] ?? [])[0] ?? "",
        pressIds: Array.from(nextSettings[2] ?? []),
      })
      .catch(() => undefined);
  };

  const saveNotificationSettings = (
    nextSettings: Record<(typeof myNotificationLabels)[number], boolean>,
    nextDarkMode = isDarkMode,
  ) => {
    const settingsId = notificationSettingsIdRef.current;
    const nextNotificationSettings = {
      breakingNews: nextSettings["속보"],
      commentReplies: nextSettings["내 댓글에 좋아요, 답글"],
      darkMode: nextDarkMode,
      notices: nextSettings["공지사항"],
    };

    if (!settingsId) {
      notificationApi
        .createNotificationSettings({
          userId: currentUserId,
          ...nextNotificationSettings,
        })
        .then((settings) => {
          notificationSettingsIdRef.current = settings.id;
        })
        .catch(() => undefined);
      return;
    }

    notificationApi
      .updateNotificationSettings(settingsId, nextNotificationSettings)
      .catch(() => undefined);
  };

  const saveNewsViewTimes = (nextTimes: Set<string>) => {
    const nextTimeList = Array.from(nextTimes);
    const settingsId = userNewsViewTimeIdRef.current;

    if (settingsId) {
      settingsApi
        .updateUserNewsViewTimes(settingsId, { times: nextTimeList })
        .catch(() => undefined);
      return;
    }

    settingsApi
      .createUserNewsViewTimes(currentUserId, nextTimeList)
      .then((settings) => {
        userNewsViewTimeIdRef.current = settings.id;
      })
      .catch(() => undefined);
  };

  const toggleCategorySetting = (groupIndex: number, optionId: string) => {
    setSelectedCategorySettings((current) => {
      const nextSettings = current.map((selectedItems, index) => {
        if (index !== groupIndex) {
          return selectedItems;
        }

        if (groupIndex === 1) {
          return new Set([optionId]);
        }

        const nextItems = new Set(selectedItems);

        if (nextItems.has(optionId)) {
          nextItems.delete(optionId);
        } else {
          nextItems.add(optionId);
        }

        return nextItems;
      });

      saveUserPreference(nextSettings);
      return nextSettings;
    });
  };

  const toggleNewsViewTime = (time: string) => {
    setSelectedNewsViewTimes((current) => {
      const next = new Set(current);

      if (next.has(time)) {
        next.delete(time);
      } else {
        next.add(time);
      }

      saveNewsViewTimes(next);
      return next;
    });
  };

  const closeBlockedKeywordDialog = useCallback(() => {
    setIsBlockedKeywordDialogOpen(false);
    setBlockedKeywordInputValue("");
  }, []);

  const saveBlockedKeyword = () => {
    const nextKeyword = blockedKeywordInputValue.trim();

    if (!nextKeyword) {
      return;
    }

    onAddBlockedKeyword(nextKeyword);
    closeBlockedKeywordDialog();
  };

  const openNewsViewTime = () => {
    myDetailScrollRestore.captureScroll();
    setActiveDetailView("newsViewTime");
  };

  const openCustomNewsSettings = () => {
    myDetailScrollRestore.captureScroll();
    setActiveDetailView("customNewsSettings");
  };

  const openProfileSettings = () => {
    myDetailScrollRestore.captureScroll();
    setActiveDetailView("profileSettings");
  };

  const openSummaryDetail = (view: MySummaryView) => {
    myDetailScrollRestore.captureScroll();
    setMyArticleDetail(null);
    setMyPolicyDetail(null);
    setActiveDetailView(view);
  };

  const openRecentDetail = () => {
    myDetailScrollRestore.captureScroll();
    setMyArticleDetail(null);
    setMyPolicyDetail(null);
    setActiveDetailView("recent");
  };

  const openMyArticleDetail: OpenArticleDetail = (article, options) => {
    myArticleDetailScrollRestore.captureScroll();
    setMyPolicyDetail(null);
    setMyArticleDetail({
      article,
      commentId: options?.commentId,
      replyToCommentId: options?.replyToCommentId,
      scrollTarget: options?.scrollTarget,
    });
  };

  const openMyPolicyDetail = (policy: PolicyItem) => {
    myArticleDetailScrollRestore.captureScroll();
    setMyArticleDetail(null);
    setMyPolicyDetail(policy);
  };

  const detailBackLabel =
    isMyNestedDetailOpen
      ? "기사 본문에서 이전 목록으로 돌아가기"
      : activeDetailView === "profileSettings"
      ? "설정에서 마이페이지로 돌아가기"
      : activeDetailView === "customNewsSettings"
      ? "맞춤형 뉴스 설정에서 마이페이지로 돌아가기"
      : "뉴스 보기 타임 설정에서 마이페이지로 돌아가기";
  const quickMenuReturnView =
    !isMyNestedDetailOpen &&
    quickMenuRequest &&
    (activeDetailView === "customNewsSettings" ||
      activeDetailView === "profileSettings")
    ? quickMenuRequest.returnView
    : null;
  const handleMyDetailBack = isMyNestedDetailOpen
    ? myArticleDetailExitMotion.closeWithMotion
    : quickMenuReturnView
      ? () => onQuickMenuBack(quickMenuReturnView)
    : myDetailExitMotion.closeWithMotion;

  return (
    <NewsRollCommonLayout
      aria-label="마이페이지"
      className="newsroll_sheetFrame container_myScreen"
      dockedGap={pagePanelDockedGap}
      initialGap={pagePanelInitialGap}
      {...fixedDockedPanelProps}
      minInitialTop={pagePanelInitialTop}
      sheetClassName="newsroll_sheetFrameSheet container_homeSheet container_mySheet"
      sheetNestedScrollResetSelector={
        isMyNestedDetailOpen ? homeDockedScrollSelectors.contentScroller : undefined
      }
      sheetScrollSelector={
        isMyNestedDetailOpen ? newsrollNewsFeedDetailSelector : pagePanelContentSelector
      }
      top={
        isMyDetailOpen ? (
          <NewsRollHeaderTop>
            <NewsToolbar
              isTextLarge={isTextLarge}
              onOpenMenu={onOpenMenu}
              onOpenSearch={onOpenSearch}
              onToggleTextSize={onToggleTextSize}
              showSearch={false}
            />
            <NewsRollDockedControls
              className="newsroll_motion_dockedPop newsroll_allDockedControls newsroll_panelHeaderRow"
              isDetailOpen
            >
              <NewsRollDetailBackButton
                ariaLabel={detailBackLabel}
                onClick={handleMyDetailBack}
              />
              <DockedAlarmButton
                isPressed={false}
                onClick={onOpenBreakingNews}
              />
            </NewsRollDockedControls>
          </NewsRollHeaderTop>
        ) : (
          <NewsRollHeaderTop>
            <NewsToolbar
              isTextLarge={isTextLarge}
              onOpenMenu={onOpenMenu}
              onOpenSearch={onOpenSearch}
              onToggleTextSize={onToggleTextSize}
            />
            <NewsRollDockedControls className="newsroll_motion_dockedPop newsroll_allDockedControls newsroll_panelHeaderRow">
              <h1 className="text_panelHeaderTitle">마이페이지</h1>
              <DockedAlarmButton
                isPressed={false}
                onClick={onOpenBreakingNews}
              />
            </NewsRollDockedControls>
          </NewsRollHeaderTop>
        )
      }
    >
      {myArticleDetail ? (
        <ArticleDetailContent
          article={myArticleDetail.article}
          initialCommentId={myArticleDetail.commentId}
          initialReplyTargetId={myArticleDetail.replyToCommentId}
          initialScrollTarget={myArticleDetail.scrollTarget}
          isLeaving={myArticleDetailExitMotion.isLeaving}
        />
      ) : myPolicyDetail ? (
        <PolicyDetailContent
          hideDetailToggle
          isLeaving={myArticleDetailExitMotion.isLeaving}
          item={myPolicyDetail}
        />
      ) : (
        <NewsRollPagePanel
          ariaLabel={
            isRecentOpen
              ? "최근 본 뉴스 상세 콘텐츠 영역"
            : isBookmarkOpen
              ? "북마크 상세 콘텐츠 영역"
            : isVoteOpen
              ? "투표 상세 콘텐츠 영역"
            : isCommentOpen
              ? "댓글 상세 콘텐츠 영역"
            : isNewsViewTimeOpen
            ? "뉴스 보기 타임 설정 영역"
            : isProfileSettingsOpen
              ? "설정 콘텐츠 영역"
            : "마이페이지 콘텐츠 영역"
          }
          contentRef={myPanelContentRef}
        >
          {isRecentOpen ? (
            <MyRecentDetailPage
              items={myDynamicRecentItems}
              isLeaving={myDetailExitMotion.isLeaving}
              onOpenArticle={openMyArticleDetail}
            />
          ) : isBookmarkOpen ? (
            <MyBookmarkDetailPage
              activeCategory={activeBookmarkCategory}
              items={myDynamicBookmarkItems}
              isLeaving={myDetailExitMotion.isLeaving}
              onCategoryChange={setActiveBookmarkCategory}
              onOpenArticle={openMyArticleDetail}
              onOpenPolicy={openMyPolicyDetail}
              showTabs={shouldShowBookmarkCategoryTabs}
              tabs={dynamicBookmarkCategoryTabs}
            />
          ) : isVoteOpen ? (
            <MyVoteDetailPage
              activeCategory={activeVoteCategory}
              items={myDynamicVoteItems}
              isLeaving={myDetailExitMotion.isLeaving}
              onCategoryChange={setActiveVoteCategory}
              onOpenArticle={openMyArticleDetail}
              showTabs={shouldShowVoteCategoryTabs}
              tabs={dynamicVoteCategoryTabs}
            />
          ) : isCommentOpen ? (
            <MyCommentDetailPage
              activeCategory={activeCommentCategory}
              items={myDynamicCommentItems}
              isLeaving={myDetailExitMotion.isLeaving}
              onCategoryChange={setActiveCommentCategory}
              onOpenArticle={openMyArticleDetail}
              showTabs={shouldShowCommentKindTabs}
              tabs={dynamicCommentCategoryTabs}
            />
          ) : isCustomNewsSettingsOpen ? (
          <div
            className={`container_mySettingsPage ${getEnterFromRightMotionClassName(myDetailExitMotion.isLeaving)}`}
          >
            <h2 className="text_myTimeTitle">맞춤형 뉴스 설정</h2>
            {myCategoryGroups.map((group, groupIndex) => (
              <Fragment key={group.title}>
                {groupIndex > 0 ? (
                  <NewsRollDivider className="divider_mySection" />
                ) : null}
                <section className="container_myCategorySection">
                  <h2 className="text_mySectionTitle">{group.title}</h2>
                  <PillTabMenu
                    ariaLabel={group.title}
                    className="tab_myCategoryMenu"
                    getItemState={(optionId) => {
                      const isSelected =
                        selectedCategorySettings[groupIndex]?.has(optionId) ?? false;

                      if (isSelected) {
                        return "active";
                      }

                      return "default";
                    }}
                    items={getMyCategoryTabItems(groupIndex)}
                    keyboardNavigation={groupIndex === 1}
                    onChange={(optionId) => toggleCategorySetting(groupIndex, optionId)}
                    role={groupIndex === 1 ? "radiogroup" : "group"}
                    value={
                      Array.from(selectedCategorySettings[groupIndex] ?? [])[0] ??
                      getMyCategoryOptionId(groupIndex, 0)
                    }
                  />
                </section>
              </Fragment>
            ))}
            <NewsRollDivider className="divider_mySection" />
            <BlockedKeywordSettingsSection
              blockedKeywordSettings={blockedKeywordSettings}
              inputValue={blockedKeywordInputValue}
              isDialogOpen={isBlockedKeywordDialogOpen}
              onCancelDialog={closeBlockedKeywordDialog}
              onInputChange={setBlockedKeywordInputValue}
              onKeywordDelete={onDeleteBlockedKeyword}
              onKeywordToggle={onToggleBlockedKeyword}
              onOpenDialog={() => setIsBlockedKeywordDialogOpen(true)}
              onSaveKeyword={saveBlockedKeyword}
            />
          </div>
          ) : isNewsViewTimeOpen ? (
          <div
            className={`container_myTimePage ${getEnterFromRightMotionClassName(myDetailExitMotion.isLeaving)}`}
          >
            <h2 className="text_myTimeTitle">뉴스 보기 타임</h2>
            {myNewsViewTimeSections.map((section, sectionIndex) => (
              <Fragment key={section.label}>
                {sectionIndex > 0 ? (
                  <NewsRollDivider className="divider_mySection" />
                ) : null}
                <section
                  aria-label={`${section.label} 시간 설정`}
                  className="container_myTimeSection"
                >
                  <h3 className="text_myTimeSectionLabel">{section.label}</h3>
                  <div className="wrapper_myTimeRows">
                    {section.times.map((time) => {
                      const isSelected = selectedNewsViewTimes.has(time);

                      return (
                        <button
                          aria-pressed={isSelected}
                          className="btn_myTimeRow"
                          key={time}
                          onClick={() => toggleNewsViewTime(time)}
                          type="button"
                        >
                          <span className="text_myTimeValue">{time}</span>
                          <NewsRollSwitch checked={isSelected} />
                        </button>
                      );
                    })}
                  </div>
                </section>
              </Fragment>
            ))}
          </div>
        ) : isProfileSettingsOpen ? (
          <div
            className={`container_mySettingsPage ${getEnterFromRightMotionClassName(myDetailExitMotion.isLeaving)}`}
          >
            <h2 className="text_myTimeTitle">설정</h2>
            {myProfileSettingSections.map((section, sectionIndex) => (
              <Fragment key={section.title}>
                {sectionIndex > 0 ? (
                  <NewsRollDivider className="divider_mySection" />
                ) : null}
                <section
                  aria-label={`${section.title} 설정`}
                  className="container_mySettingsDetailSection"
                >
                  <div className="wrapper_mySettingsList">
                    {section.items.map((item) => (
                      <MySettingRow
                        key={item}
                        label={item}
                        showChevron
                      />
                    ))}
                  </div>
                </section>
              </Fragment>
            ))}
          </div>
        ) : (
          <div className="container_myContent">
          <section className="container_myProfile" aria-label="프로필">
            <span className="wrapper_myProfileGreeting">
              <strong>콩콩이님</strong>
              <span>안녕하세요</span>
            </span>
            <div className="wrapper_articleActions" aria-label="프로필 도구" role="group">
              <IconButton
                aria-pressed={isProfileSettingsOpen}
                baseClassName="btn_articleTool"
                icon="setting"
                label="설정"
                onClick={openProfileSettings}
              />
            </div>
          </section>

          <div
            className="wrapper_articleReaction wrapper_myActivity"
            aria-label="활동 통계"
            role="group"
          >
            {mySummaryItems.map((item) => (
              <ReactionButton
                aria-pressed={activeSummary === item.value}
                icon={item.icon}
                key={item.value}
                onClick={() => openSummaryDetail(item.value)}
                tone={item.tone}
                variant="article"
              >
                <strong>
                  {item.label} {myActivityCounts[item.value]}
                </strong>
              </ReactionButton>
            ))}
          </div>

          <section className="container_myRecent" aria-label="최근 본 뉴스">
            <h2 className="text_mySectionTitle">최근 본 뉴스</h2>
            {myDynamicRecentItems.length === 0 ? (
              <DataUnavailableMessage target="최근 본 뉴스" />
            ) : (
              <>
                <div className="wrapper_myRecentScroller wrapper_myPageRecentBlock">
                  {myDynamicRecentItems.slice(0, myRecentPreviewLimit).map((item, index) => (
                    <NewsBlockItem
                      ariaPressed={false}
                      dateLabel={item.time}
                      dateTime={item.dateTime}
                      imageSrc={item.image}
                      key={`${item.title}-${index}`}
                      onClick={() => openMyArticleDetail(createMyRecentArticle(item, index))}
                      showDate={false}
                      title={item.title}
                    />
                  ))}
                </div>
                <AllNewsMoreButton
                  ariaLabel="최근 본 뉴스 전체 보기"
                  collapsedLabel="전체 보기"
                  onClick={openRecentDetail}
                  showIcon={false}
                />
              </>
            )}
          </section>

          <section className="container_mySettingsSection">
            <NewsRollDivider className="divider_mySection" />
            <h2 className="text_mySectionTitle">뉴스 설정</h2>
            <div className="wrapper_mySettingsList">
              <MySettingRow
                label="맞춤형 뉴스 설정"
                onClick={openCustomNewsSettings}
                showChevron
              />
            </div>
          </section>

          <section
            className="container_mySettingsSection"
            data-my-section="notification-settings"
          >
            <NewsRollDivider className="divider_mySection" />
            <h2 className="text_mySectionTitle">알림 설정</h2>
            <div className="wrapper_mySettingsList">
              {myNotificationLabels.map((label) => (
                <MySettingRow
                  checked={notificationSettings[label]}
                  key={label}
                  label={label}
                  onClick={() => {
                    setNotificationSettings((currentSettings) => {
                      const nextSettings = {
                        ...currentSettings,
                      } as Record<(typeof myNotificationLabels)[number], boolean>;

                      nextSettings[label] = !currentSettings[label];

                      saveNotificationSettings(nextSettings);
                      return nextSettings;
                    });
                  }}
                />
              ))}
              <MySettingRow
                label="뉴스보기 타임"
                onClick={openNewsViewTime}
                showChevron
              />
            </div>
          </section>

          <section className="container_mySettingsSection">
            <NewsRollDivider className="divider_mySection" />
            <h2 className="text_mySectionTitle">디스플레이 설정</h2>
            <div className="wrapper_mySettingsList">
              <MySettingRow
                checked={isDarkMode}
                label="다크모드"
                onClick={() => {
                  const nextDarkMode = !isDarkMode;

                  onDarkModeChange(nextDarkMode);
                  saveNotificationSettings(notificationSettings, nextDarkMode);
                }}
              />
            </div>
          </section>
          </div>
        )}
      </NewsRollPagePanel>
      )}
    </NewsRollCommonLayout>
  );
}
