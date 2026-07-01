"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type Ref
} from "react";
import { createPortal } from "react-dom";

import {
  commentApi,
  newsApi,
  pollApi,
  userContentActionApi,
  type Comment,
  type NewsListItem,
  type UserContentAction
} from "@/app/_newsroll/api";
import {
  currentUserId,
  getCurrentUserSnapshot,
} from "@/app/_newsroll/auth/current-user";
import {
  ActionMenu,
  ArticleVoteOptionButton,
  NoticeCardLink,
  ChipLabel,
  Icon,
  IconButton,
  Divider,
  ContentActionButton,
  DateTimeText,
  SelectButton,
  NewsViewToggle,
  PillTabMenu,
  PrimaryButton,
  PrimaryButtonGroup,
  IconTextButton,
  getSearchHighlightTargetId,
  getSearchTextParagraphs,
  scrollSearchHighlightTargetIntoView,
  SearchHighlightText,
  TextButton,
  TextInput,
  Textarea,
  useActionMenuDismiss,
} from "@/design-system/components";
import {
  NewsRollArticleDetailPanel,
  NewsRollCommonLayout,
  NewsRollDetailBackButton,
  NewsRollDockedControls,
  NewsRollSummaryHeroTop,
  newsrollCommentScrollDelayMs as commentScrollDelayMs,
  getEnterFromRightMotionClassName,
  newsrollHomeDockedScrollSelectors as homeDockedScrollSelectors,
  newsrollHomeSheetDockedGap as homeSheetDockedGap,
  newsrollHomeSheetInitialGap as homeSheetInitialGap,
  newsrollHomeSheetScrollSelector as homeSheetScrollSelector,
  newsrollArticleCardSelector,
  newsrollArticleContentScrollerSelector,
  newsrollCommentScrollRootSelectors,
  newsrollNewsFeedSelector,
  newsrollDetailRevealDelayMs as nextArticleRevealDelayMs,
  newsrollPagePanelInitialTop as pagePanelInitialTop,
  useDeferredDetailScroll,
  useDockedPanelScroll,
  useInlineTextEdit,
  useShareContent
} from "@/design-system/templates";
import { useCommentThread } from "@/features/comments/hooks/use-comment-thread";
import {
  getVisibleReactionCount,
  MiniReactionControls,
  ReactionControls,
  type Reaction,
  type ReactionValue,
} from "@/features/news/article/article-reactions";
export { getVisibleReactionCount } from "@/features/news/article/article-reactions";
import { useArticleReaction } from "@/features/news/article/use-article-reaction";
import {
  emptyCommentReactionCounts,
  formatCommentDate,
  getCommentAuthor,
  getCommentChoice,
  getCommentItemFromApi,
  type CommentId,
  type CommentItem,
  type CommentReactionValue,
} from "@/features/comments/utils/comment-data";
import { BottomFixedActionBar } from "@/features/shared/BottomFixedActionBar";
import { ConfirmDialog } from "@/features/shared/ConfirmDialog";
import { DataUnavailableMessage } from "@/features/shared/DataUnavailableMessage";
import { useBookmarkTarget } from "@/features/shared/use-bookmark-target";
import { DockedAlarmButton, NewsToolbar } from "@/features/shell/NewsRollToolbar";
import type { Tab } from "@/features/shell/navigation";
export type { BodySearchSelection, BodySearchSelectionInput } from "@/features/search/model";
export { navItems } from "@/features/shell/navigation";
export type { Tab } from "@/features/shell/navigation";

export type HomeViewMode = "reels" | "block";
type CommentSortOrder = "latest" | "popular";
type CommentAction = "block" | "delete" | "edit" | "hide" | "report";
type CommentReportTarget = {
  targetId: string;
  targetType: "comment" | "reply";
  targetUserId: string;
};
type GuideKind = "stacked" | "binary";
type CommentScrollTarget = {
  bottomGap?: number;
  delayMs?: number;
  id: string;
};
type BodySearchTargetKey = "body" | "category" | "source" | "title";
export type ArticleDetailOpenOptions = {
  commentId?: CommentId;
  replyToCommentId?: CommentId;
  scrollTarget?: "bodySearch" | "poll";
};

export type OpenArticleDetail = (
  article: HomeArticle,
  options?: ArticleDetailOpenOptions,
) => void;
const commentPanelOpenHintOffset = 112;

export type HomeArticle = {
  body?: string;
  category: string;
  categoryId?: string;
  date: string;
  dateTime?: string;
  image: string;
  imageAlt: string;
  guideKind?: GuideKind;
  id?: string;
  ageGroupIds?: string[];
  pressId?: string;
  pressName?: string;
  reporterName?: string;
  title: string;
};
type BreakingNewsItem = {
  article: HomeArticle;
  id: string;
  title: string;
  updatedAt: string;
};
export type BlockedKeywordSetting = {
  id?: string;
  isActive: boolean;
  keyword: string;
};
type HomeHeaderControls = {
  breakingItem?: BreakingNewsItem | null;
  breakingTitle?: string;
  dockedControlsMotionClassName?: string;
  forceDockedDetail?: boolean;
  isDetailOpen?: boolean;
  isTextLarge: boolean;
  mode: HomeViewMode;
  newsCount: number;
  onCloseDetail?: () => void;
  onOpenBreakingArticle?: (article: HomeArticle) => void;
  onModeChange: (mode: HomeViewMode) => void;
  onOpenBreakingNews: () => void;
  onOpenNotifications: () => void;
  onOpenSearch: () => void;
  onToggleTextSize: () => void;
};
type PolicyDetailItem = {
  label: string;
  value: string;
};
export type PolicyItem = {
  ageGroupIds?: string[];
  details: PolicyDetailItem[];
  id: string;
  registeredAt: string;
  summary: string;
  tags: string[];
  title: string;
  updatedAt: string;
};
export const articleImage = "/images/news-apartment.png";
export const defaultNewsDateTime = "2026-12-31T08:30:00";
export const defaultNewsDateLabel = "2026년 12월 31일 08:30";

export function NewsCreatedTime({
  children = defaultNewsDateLabel,
  dateTime = defaultNewsDateTime,
}: {
  children?: ReactNode;
  dateTime?: string;
}) {
  return (
    <DateTimeText dateTime={dateTime}>
      {children}
    </DateTimeText>
  );
}

export function formatNewsDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return defaultNewsDateLabel;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatHeroCount(count: number) {
  return new Intl.NumberFormat("ko-KR").format(count);
}

function getHomeArticleGuideKind(index: number): GuideKind {
  return index % 2 === 0 ? "stacked" : "binary";
}

export function getHomeArticleFromNews(item: NewsListItem, index: number): HomeArticle {
  return {
    ageGroupIds: item.ageGroupIds,
    body: item.body,
    category: item.category?.label ?? item.categoryId,
    categoryId: item.categoryId,
    date: formatNewsDate(item.publishedAt),
    dateTime: item.publishedAt,
    guideKind: getHomeArticleGuideKind(index),
    id: item.id,
    image: item.imageUrl,
    imageAlt: item.title,
    pressId: item.pressId,
    pressName: item.press?.name,
    reporterName: item.reporterName,
    title: item.title,
  };
}

function getBreakingTimestamp(article: HomeArticle) {
  const timestamp = Date.parse(article.dateTime ?? "");

  return Number.isFinite(timestamp) ? timestamp : 0;
}

function getBreakingDateId(updatedAt: string) {
  return updatedAt.replace(/\D/g, "").slice(0, 14) || "unknown";
}

export function getBreakingNewsItems(articles: HomeArticle[]) {
  return [...articles]
    .sort((current, next) => getBreakingTimestamp(next) - getBreakingTimestamp(current))
    .map<BreakingNewsItem>((article, index) => {
      const updatedAt = article.dateTime ?? defaultNewsDateTime;

      return {
        article,
        id: `all-breaking-news-${getBreakingDateId(updatedAt)}-${article.id ?? index}`,
        title: article.title,
        updatedAt,
      };
    });
}

export function getLatestBreakingNewsItem(articles: HomeArticle[]) {
  return getBreakingNewsItems(articles)[0] ?? null;
}

function normalizeBlockedKeyword(value: string) {
  return value.trim().toLocaleLowerCase("ko-KR");
}

function getArticleFilterText(article: HomeArticle) {
  return [
    article.title,
    article.body,
    article.category,
    article.pressName,
    article.reporterName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("ko-KR");
}

export function filterArticlesByBlockedKeywords(
  articles: HomeArticle[],
  blockedKeywords: string[],
) {
  const keywords = blockedKeywords.map(normalizeBlockedKeyword).filter(Boolean);

  if (keywords.length === 0) {
    return articles;
  }

  return articles.filter((article) => {
    const articleText = getArticleFilterText(article);

    return !keywords.some((keyword) => articleText.includes(keyword));
  });
}

export const homeArticle: HomeArticle = {
  category: "정치",
  date: "2026년 12월 31일 08:30",
  image: articleImage,
  imageAlt: "아파트 단지 전경",
  title: "용인 수지, 강남·분당 가격 동조화로 15억 시대 진입",
};

export const homeArticles: HomeArticle[] = [
  {
    ...homeArticle,
    guideKind: "stacked",
  },
  {
    category: "경제",
    date: "2026년 12월 31일 09:10",
    guideKind: "binary",
    image: articleImage,
    imageAlt: "도심 아파트 단지 전경",
    title: "대출 규제 이후 서울 외곽 거래량 다시 줄었다",
  },
  {
    category: "사회",
    date: "2026년 12월 31일 10:20",
    guideKind: "stacked",
    image: articleImage,
    imageAlt: "아침 햇살이 비치는 주거 단지",
    title: "청년 월세 지원 확대 논의, 지자체별 신청 조건 달라",
  },
  {
    category: "정책",
    date: "2026년 12월 31일 11:35",
    guideKind: "binary",
    image: articleImage,
    imageAlt: "신축 공동주택 단지",
    title: "주택시장 안정 대책 발표 앞두고 실수요자 관망세",
  },
  {
    category: "지역",
    date: "2026년 12월 31일 13:00",
    guideKind: "stacked",
    image: articleImage,
    imageAlt: "수도권 아파트 단지",
    title: "수도권 남부 교통 호재 지역, 매수 문의만 소폭 증가",
  },
  {
    category: "복지",
    date: "2026년 12월 31일 14:25",
    guideKind: "binary",
    image: articleImage,
    imageAlt: "주거지와 상가가 함께 보이는 단지",
    title: "신혼부부 주거비 지원 기준 완화 여부 다음 달 결정",
  },
  {
    category: "문화",
    date: "2026년 12월 31일 15:40",
    guideKind: "stacked",
    image: articleImage,
    imageAlt: "도심 주거 단지와 하늘",
    title: "동네 생활권 문화시설 확충, 주민 체감도 조사 시작",
  },
];

const homeBreakingTitle =
  "정청래, ‘필버 중단’ 국민의 힘에 “대구/경북 통합 찬반 당론 먼저 정하라”";


const articleBody = `최근 국내 부동산 시장이 다시 한번 변곡점에 서고 있다. 상반기 동안 이어졌던 거래 회복 흐름이 둔화되며, 시장 전반에 신중한 분위기가 확산되는 모습이다.

특히 수도권과 일부 광역시를 중심으로 매수 심리가 빠르게 식고 있다. 한국부동산연구원이 발표한 자료에 따르면, 기준금리 유지에도 불구하고 주택담보대출 심사 강화와 보유세 부담이 실수요자와 투자자 모두에게 압박으로 작용하고 있다.

전문가들은 당분간 가격 급등이나 급락보다는 지역별 양극화가 심화될 가능성에 주목한다. 정책 변화와 금리 방향성이 명확해지기 전까지는 관망세가 이어질 것이며, 안정적인 실거주 중심의 시장 재편이 예상된다.`;

export const guideOptions = [
  "어쩌구 저쩌구해서 어케 해야한다.",
  "상황을 더 지켜본 뒤 판단해야 한다.",
  "정책 지원을 먼저 확대해야 한다.",
];

const articleGuideQuestion =
  "예시텍스트 어쩌구랑 어쩌구랑 비교했을때 어케하는게 좋을까?";

export const binaryGuideOptions = ["그렇다", "아니다"];

const commentBodies = [
  "예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트...",
  "예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트...",
  "예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트...",
];

export const commentTemplates: Omit<CommentItem, "choice">[] = [
  {
    author: "콩콩이",
    body: commentBodies[0],
    date: "2026.12.31 08:30",
    dislikes: 0,
    id: "template-comment-1",
    likes: 0,
    replies: 13,
    userId: "template-user-1",
  },
  {
    author: "콩콩이",
    body: commentBodies[1],
    date: "2026.12.31 08:30",
    dislikes: 0,
    id: "template-comment-2",
    likes: 0,
    replies: 13,
    userId: "template-user-2",
  },
  {
    author: "콩콩이",
    body: commentBodies[2],
    date: "2026.12.31 08:30",
    dislikes: 0,
    id: "template-comment-3",
    likes: 0,
    replies: 13,
    userId: "template-user-3",
  },
];

export const commentReplyTemplates = [
  {
    author: "콩콩이",
    body: "예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트~~",
    choice: "아모른직다",
    date: "2026.12.31 08:30",
    dislikes: 0,
    isMine: true,
    likes: 0,
  },
  {
    author: "콩콩이",
    body: "예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트~~",
    choice: "아모른직다",
    date: "2026.12.31 08:30",
    dislikes: 0,
    likes: 0,
  },
];

export type CommentReplyItem = (typeof commentReplyTemplates)[number] & {
  id: string;
  isMine?: boolean;
  userId?: string;
};

const commentSortOptions: { label: string; value: CommentSortOrder }[] = [
  { label: "인기순", value: "popular" },
  { label: "최신순", value: "latest" },
];

const myCommentActionOptions: { label: string; value: CommentAction }[] = [
  { label: "수정", value: "edit" },
  { label: "삭제", value: "delete" },
];

const otherCommentActionOptions: { label: string; value: CommentAction }[] = [
  { label: "신고", value: "report" },
  { label: "차단", value: "block" },
  { label: "숨김", value: "hide" },
];

const commentReportReasons = [
  "스팸/광고",
  "욕설/비방",
  "혐오/차별",
  "개인정보 노출",
  "허위 정보",
  "기타",
];

const allNewsAssets = {
  latest: articleImage,
  relayOne: articleImage,
  relayTwo: articleImage,
  relayThree: articleImage,
  relayFour: articleImage,
  relayFive: articleImage,
  thumbnail: articleImage,
};

export const allNewsLatest = [
  {
    category: "정치",
    image: allNewsAssets.latest,
    title: "'APEC, 국익에 도움됐다' 74%… 국힘 지지층도 인정 '50%가 긍정'",
  },
  {
    category: "경제",
    image: allNewsAssets.relayOne,
    title: "수도권 아파트 거래량 회복세, 실수요 중심으로 재편",
  },
  {
    category: "사회",
    image: allNewsAssets.relayTwo,
    title: "청년 주거 지원 확대 논의, 지자체별 신청 조건 달라",
  },
  {
    category: "국제",
    image: allNewsAssets.relayThree,
    title: "중동 긴장 재고조에 원유·물가 변동성 확대 우려",
  },
  {
    category: "문화",
    image: allNewsAssets.relayFour,
    title: "지역 축제 방문객 증가, 골목상권 매출도 동반 상승",
  },
];

export const allNewsPresses = ["중앙일보", "국민일보", "한겨레"];
export const allNewsDockedScrollSelectors = {
  contentScroller: ".all_panelContent",
  immediatePanel: ".all_latest_panel",
  latestScroller: ".all_latest_scroller",
  panel: ".all_panel",
};
export const allNewsSwipeAxisThresholdPx = 8;
export type SwipeAxis = "horizontal" | "vertical";

export const allNewsHeadlinesByPress: Record<
  string,
  { image: string; title: string }[]
> = {
  국민일보: Array.from({ length: 8 }, (_, index) => ({
    image: [
      allNewsAssets.thumbnail,
      allNewsAssets.relayOne,
      allNewsAssets.relayTwo,
    ][index % 3],
    title:
      index % 2 === 0
        ? "용인 수지, 강남·분당 가격 동조화로 15억 시대 진입"
        : "대출 규제 강화 이후 실수요자 관망세 뚜렷",
  })),
  중앙일보: Array.from({ length: 8 }, (_, index) => ({
    image: [
      allNewsAssets.latest,
      allNewsAssets.relayThree,
      allNewsAssets.relayFour,
    ][index % 3],
    title:
      index % 2 === 0
        ? "'APEC, 국익에 도움됐다' 74%… 국힘 지지층도 인정"
        : "여야, 예산안 세부 쟁점 두고 막판 협상",
  })),
  한겨레: Array.from({ length: 8 }, (_, index) => ({
    image: [
      allNewsAssets.relayFive,
      allNewsAssets.relayTwo,
      allNewsAssets.thumbnail,
    ][index % 3],
    title:
      index % 2 === 0
        ? "청년 주거 정책, 신청 문턱 낮춰야 한다는 지적"
        : "지역 의료 공백 해소 위한 공공지원 논의 확대",
  })),
};

export const allNewsRelayCategories = ["정치", "경제", "사회", "문화", "국제"];

function HomeArticleMeta({
  className = "article_meta wrapper_betweenRow u_m0",
  date,
  dateTime = defaultNewsDateTime,
}: {
  className?: string;
  date: string;
  dateTime?: string;
}) {
  return (
    <p className={className}>
      <NewsCreatedTime dateTime={dateTime}>{date}</NewsCreatedTime>
    </p>
  );
}

function HomeMainHeader({
  breakingItem = null,
  breakingTitle = homeBreakingTitle,
  dockedControlsMotionClassName = "",
  isDetailOpen = false,
  isTextLarge,
  mode,
  newsCount,
  onCloseDetail,
  onOpenBreakingArticle,
  onModeChange,
  onOpenBreakingNews,
  onOpenNotifications,
  onOpenSearch,
  onToggleTextSize,
}: HomeHeaderControls) {
  const currentUser = getCurrentUserSnapshot();

  return (
      <NewsRollSummaryHeroTop
        footer={
          <div className="wrapper_breakingNews">
            <NoticeCardLink
              href={breakingItem ? `#${breakingItem.id}` : "#all-breaking-news"}
              id={breakingItem ? `home-${breakingItem.id}` : undefined}
              onClick={(event) => {
                event.preventDefault();
                if (breakingItem && onOpenBreakingArticle) {
                  onOpenBreakingArticle(breakingItem.article);
                  return;
                }

                onOpenBreakingNews();
              }}
              showIcon
              title={breakingTitle}
              updatedAt={breakingItem?.updatedAt}
              type="breaking"
            />
          </div>
        }
        toolbar={
          <NewsToolbar
            isTextLarge={isTextLarge}
            onOpenNotifications={onOpenNotifications}
            onOpenSearch={onOpenSearch}
            onToggleTextSize={onToggleTextSize}
          />
        }
        hero={{
          ariaLabel: "홈 요약",
          caption: "새로운 소식이 있습니다.",
          controls: (
            <NewsRollDockedControls
              className={`motion_dockedPop homeDockedMotion ${dockedControlsMotionClassName}`.trim()}
              isDetailOpen={isDetailOpen}
            >
              {isDetailOpen ? (
                <NewsRollDetailBackButton
                  ariaLabel="블록형 뉴스 목록으로 돌아가기"
                  onClick={onCloseDetail}
                />
              ) : (
                <NewsViewToggle mode={mode} onModeChange={onModeChange} />
              )}
              <DockedAlarmButton
                aria-label="속보"
                aria-pressed={false}
                onClick={onOpenBreakingNews}
              />
            </NewsRollDockedControls>
          ),
          count: formatHeroCount(newsCount),
          greeting: (
            <>
              반갑습니다 <strong>{currentUser.nickname}</strong>님!
            </>
          ),
          unit: "개",
        }}
      />
  );
}

export function HomeShell({
  breakingItem,
  breakingTitle,
  children,
  forceDockedDetail = false,
  isDetailOpen = false,
  isTextLarge,
  mode,
  newsCount,
  onCloseDetail,
  onOpenBreakingArticle,
  onModeChange,
  onPanelChange,
  onOpenBreakingNews,
  onOpenNotifications,
  onOpenSearch,
  onToggleTextSize,
}: HomeHeaderControls & {
  children: ReactNode;
  onPanelChange?: () => void;
}) {
  const screenRef = useRef<HTMLElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLElement | null>(null);
  const previousModeRef = useRef(mode);
  const [dockedControlsMotionClassName, setDockedControlsMotionClassName] =
    useState("");
  const dockedControlsMotionClassRef = useRef("");
  const dockedPanelScroll = useDockedPanelScroll({
    boundaryDelayMs: nextArticleRevealDelayMs,
    contentScrollerSelector: homeDockedScrollSelectors.contentScroller,
    dockedClassName: "is_homeSheetDocked",
    onActivePanelChange: onPanelChange,
    panelSelector: homeDockedScrollSelectors.panel,
    rootRef: screenRef,
    scrollerRef,
  });

  const handleSheetScroll = () => {
    dockedPanelScroll.storeScrollTop();
  };

  useEffect(() => {
    const screen = screenRef.current;

    if (!screen) {
      return;
    }

    const setMotionClass = (nextClassName: string) => {
      dockedControlsMotionClassRef.current = nextClassName;
      setDockedControlsMotionClassName(nextClassName);
    };
    const syncMotionState = () => {
      const isDocked = screen.classList.contains("is_homeSheetDocked");

      if (isDocked) {
        setMotionClass("is_motionVisible");
        return;
      }

      setMotionClass("");
    };
    const observer = new MutationObserver(syncMotionState);

    syncMotionState();
    observer.observe(screen, {
      attributeFilter: ["class"],
      attributes: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    const nextScroller =
      sheetRef.current?.querySelector<HTMLElement>(homeSheetScrollSelector) ??
      null;
    const didModeChange = previousModeRef.current !== mode;

    scrollerRef.current = nextScroller;
    if (nextScroller) {
      if (didModeChange) {
        dockedPanelScroll.resetScroll(nextScroller);
      } else if (screenRef.current?.classList.contains("is_homeSheetDocked")) {
        dockedPanelScroll.restoreScrollTop(nextScroller);
      } else {
        nextScroller.scrollTop = 0;
      }
    }
    previousModeRef.current = mode;
  }, [children, mode]);

  return (
    <NewsRollCommonLayout
      aria-label="메인 뉴스"
      className="container_homeScreen"
      dockedClassName="is_homeSheetDocked"
      dockedGap={homeSheetDockedGap}
      initialGap={homeSheetInitialGap}
      initiallyDocked={forceDockedDetail}
      lockSheetPosition={forceDockedDetail}
      minInitialTop={pagePanelInitialTop}
      movingSheet
      onTouchMoveCapture={dockedPanelScroll.handleTouchMove}
      onTouchStartCapture={dockedPanelScroll.handleTouchStart}
      onWheelCapture={dockedPanelScroll.handleWheel}
      ref={screenRef}
      sheetClassName="container_homeSheet"
      sheetNestedScrollResetSelector={homeDockedScrollSelectors.contentScroller}
      sheetProps={{ onScrollCapture: handleSheetScroll }}
      sheetRef={sheetRef}
      sheetScrollSelector={homeSheetScrollSelector}
      top={
        <HomeMainHeader
          breakingItem={breakingItem}
          breakingTitle={breakingTitle}
          isDetailOpen={isDetailOpen}
          isTextLarge={isTextLarge}
          dockedControlsMotionClassName={dockedControlsMotionClassName}
          mode={mode}
          newsCount={newsCount}
          onCloseDetail={onCloseDetail}
          onOpenBreakingArticle={onOpenBreakingArticle}
          onModeChange={onModeChange}
          onOpenBreakingNews={onOpenBreakingNews}
          onOpenNotifications={onOpenNotifications}
          onOpenSearch={onOpenSearch}
          onToggleTextSize={onToggleTextSize}
        />
      }
    >
      {children}
    </NewsRollCommonLayout>
  );
}

function getVotePercentages(voteCounts: number[]) {
  const totalVotes = voteCounts.reduce((sum, count) => sum + count, 0);

  if (totalVotes === 0) {
    return voteCounts.map(() => 0);
  }

  const rawPercentages = voteCounts.map((count) => (count / totalVotes) * 100);
  const percentages = rawPercentages.map(Math.floor);
  let remainder = 100 - percentages.reduce((sum, percent) => sum + percent, 0);
  const remainderOrder = rawPercentages
    .map((percent, index) => ({
      index,
      remainder: percent - Math.floor(percent),
    }))
    .sort((a, b) => b.remainder - a.remainder);

  for (let index = 0; index < remainder; index += 1) {
    percentages[remainderOrder[index % remainderOrder.length].index] += 1;
  }

  return percentages;
}

export { ArticleVoteOptionButton };

function ArticleGuideSection({
  id,
  kind,
  newsId,
}: {
  id?: string;
  kind: GuideKind;
  newsId?: string;
}) {
  const [selectedGuideOption, setSelectedGuideOption] = useState<number | null>(
    null,
  );
  const [currentPollVoteId, setCurrentPollVoteId] = useState<string | null>(null);
  const fallbackOptions = useMemo(
    () => (kind === "binary" ? binaryGuideOptions : guideOptions),
    [kind],
  );
  const [pollDetail, setPollDetail] = useState<Awaited<ReturnType<typeof pollApi.getPoll>>>(null);
  const options =
    pollDetail?.options.map((option) => option.label) ?? fallbackOptions;
  const [voteCounts, setVoteCounts] = useState(() => options.map(() => 0));
  const totalVotes = voteCounts.reduce((sum, count) => sum + count, 0);
  const percentages = getVotePercentages(voteCounts);
  const hasVoted = selectedGuideOption !== null;

  useEffect(() => {
    let ignore = false;

    async function loadPoll() {
      if (!newsId) {
        setPollDetail(null);
        setSelectedGuideOption(null);
        setCurrentPollVoteId(null);
        setVoteCounts(fallbackOptions.map(() => 0));
        return;
      }

      const nextPoll = await pollApi.getPoll(newsId);

      if (ignore) {
        return;
      }

      setPollDetail(nextPoll);
      const nextOptions = nextPoll?.options ?? [];
      const nextCounts =
        nextOptions.length > 0
          ? nextOptions.map(
              (option) =>
                nextPoll?.votes.filter((vote) => vote.pollOptionId === option.id)
                  .length ?? 0,
            )
          : fallbackOptions.map(() => 0);
      const currentVoteIndex = nextPoll?.currentUserVote
        ? nextOptions.findIndex(
            (option) => option.id === nextPoll.currentUserVote?.pollOptionId,
          )
        : -1;

      setVoteCounts(nextCounts);
      setSelectedGuideOption(currentVoteIndex >= 0 ? currentVoteIndex : null);
      setCurrentPollVoteId(nextPoll?.currentUserVote?.id ?? null);
    }

    loadPoll().catch(() => {
      if (!ignore) {
        setPollDetail(null);
        setSelectedGuideOption(null);
        setCurrentPollVoteId(null);
        setVoteCounts(fallbackOptions.map(() => 0));
      }
    });

    return () => {
      ignore = true;
    };
  }, [fallbackOptions, newsId]);

  async function recordPollArticleActivity() {
    if (!newsId) {
      return;
    }

    await newsApi
      .addRecentNewsView({
        newsId,
        userId: currentUserId,
      })
      .catch(() => undefined);
  }

  async function vote(index: number) {
    if (selectedGuideOption === index) {
      setSelectedGuideOption(null);
      setVoteCounts((currentCounts) =>
        currentCounts.map((count, countIndex) =>
          countIndex === index ? Math.max(0, count - 1) : count,
        ),
      );

      if (currentPollVoteId) {
        const voteId = currentPollVoteId;

        setCurrentPollVoteId(null);
        await pollApi.removePollVote(voteId);
      }

      return;
    }

    let nextPollDetail = pollDetail;
    let option = nextPollDetail?.options[index];

    const previousSelectedIndex = selectedGuideOption;

    setSelectedGuideOption(index);
    setVoteCounts((currentCounts) =>
      currentCounts.map((count, countIndex) =>
        countIndex === index
          ? count + 1
          : countIndex === previousSelectedIndex
            ? Math.max(0, count - 1)
            : count,
      ),
    );

    if (!nextPollDetail && newsId) {
      nextPollDetail = await pollApi.createPoll({
        newsId,
        options: fallbackOptions,
        title: articleGuideQuestion,
      });
      option = nextPollDetail.options[index];
      setPollDetail(nextPollDetail);
    }

    if (nextPollDetail && option) {
      if (currentPollVoteId) {
        await pollApi.updatePollVote(currentPollVoteId, option.id);
        await recordPollArticleActivity();
        return;
      }

      const nextVote = await pollApi.submitPollVote({
        pollId: nextPollDetail.id,
        pollOptionId: option.id,
        userId: currentUserId,
      });
      await recordPollArticleActivity();
      setCurrentPollVoteId(nextVote.id);
    }
  }

  return (
    <section
      className={`wrapper_articleGuide wrapper_articleGuide_${kind}`}
      id={id}
      aria-label="안내 문구"
    >
      <h2 className="text_articleGuide">
        {articleGuideQuestion}
      </h2>
      <div className="wrapper_articleGuideOptions">
        {options.map((option, index) => {
          const percent = percentages[index];

          return (
            <ArticleVoteOptionButton
              binaryTone={
                kind === "binary"
                  ? option === binaryGuideOptions[0]
                    ? "yes"
                    : "no"
                  : undefined
              }
              iconSrc={
                kind === "binary"
                  ? option === binaryGuideOptions[0]
                    ? "/icons/icon_yes.svg"
                    : "/icons/icon_no.svg"
                  : undefined
              }
              key={option}
              label={option}
              onClick={() => vote(index)}
              percent={percent}
              showResult={hasVoted}
              state={selectedGuideOption === index ? "active" : "default"}
              variant={kind}
            />
          );
        })}
      </div>
      <p className="text_articleGuideTotal">
        <strong>{totalVotes}명</strong>이 참여했어요.
      </p>
    </section>
  );
}

function CommentInlineEditor({
  ariaLabel,
  onCancel,
  onChange,
  onSave,
  value,
}: {
  ariaLabel: string;
  onCancel: () => void;
  onChange: (value: string) => void;
  onSave: () => void;
  value: string;
}) {
  return (
    <div className="wrapper_commentEdit">
      <Textarea
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        value={value}
        variant="commentEdit"
      />
      <PrimaryButtonGroup columns={2}>
        <PrimaryButton
          onClick={onSave}
          type="button"
        >
          저장
        </PrimaryButton>
        <PrimaryButton
          onClick={onCancel}
          tone="neutral"
          type="button"
        >
          취소
        </PrimaryButton>
      </PrimaryButtonGroup>
    </div>
  );
}

function CommentReactionPanel({
  guideKind,
  id,
  initialCommentId,
  initialReplyTargetId,
  newsId,
}: {
  guideKind: GuideKind;
  id?: string;
  initialCommentId?: CommentId;
  initialReplyTargetId?: CommentId;
  newsId?: string;
}) {
  const guideChoices =
    guideKind === "binary" ? binaryGuideOptions : guideOptions;
  const panelId = id ?? "home-comment-panel";
  const composerId = `${panelId}-composer`;
  const commentSortMenuId = `${panelId}-sort-menu`;
  const panelRef = useRef<HTMLElement | null>(null);
  const commentTabs = useMemo(
    () => [
      { id: "all", label: "전체" },
      ...guideChoices.map((choice) => ({ id: choice, label: choice })),
    ],
    [guideChoices],
  );
  const [activeChoice, setActiveChoice] = useState(commentTabs[0].id);
  const [composerDraft, setComposerDraft] = useState("");
  const [composerMode, setComposerMode] = useState<"comment" | "reply">(
    "comment",
  );
  const {
    apiComments,
    commentLoadFailed,
    commentReactionCounts,
    commentReactionRows,
    commentReactions,
    pollOptionLabelById,
    reloadComments,
    setApiComments,
    setCommentReactionCounts,
    setCommentReactions,
  } = useCommentThread(newsId);
  const [deletedCommentIds, setDeletedCommentIds] = useState<CommentId[]>([]);
  const [deletedReplyIds, setDeletedReplyIds] = useState<string[]>([]);
  const [contentActions, setContentActions] = useState<UserContentAction[]>([]);
  const [expandedReplyId, setExpandedReplyId] = useState<CommentId | null>(
    null,
  );
  const [isComposerVisible, setIsComposerVisible] = useState(true);
  const [composerHeight, setComposerHeight] = useState(0);
  const [myCommentsOnly, setMyCommentsOnly] = useState(false);
  const [isCommentSortOpen, setIsCommentSortOpen] = useState(false);
  const [openCommentActionId, setOpenCommentActionId] =
    useState<CommentId | null>(null);
  const [openReplyActionId, setOpenReplyActionId] = useState<string | null>(
    null,
  );
  const [replyTargetCommentId, setReplyTargetCommentId] = useState<
    CommentId | null
  >(null);
  const [sortOrder, setSortOrder] = useState<CommentSortOrder>("popular");
  const [pendingScrollTarget, setPendingScrollTarget] =
    useState<CommentScrollTarget | null>(null);
  const [reportTarget, setReportTarget] = useState<CommentReportTarget | null>(
    null,
  );
  const [reportReason, setReportReason] = useState(commentReportReasons[0]);
  const [isReportReasonOpen, setIsReportReasonOpen] = useState(false);
  const [isReportSubmitting, setIsReportSubmitting] = useState(false);
  const [moderationConfirmMessage, setModerationConfirmMessage] = useState("");
  const commentEdit = useInlineTextEdit<CommentId>();
  const replyEdit = useInlineTextEdit<string>();
  const initialCommentScrollKeyRef = useRef<string | null>(null);
  const replyComposerHistoryRef = useRef(false);
  const initialCommentTargetId =
    initialCommentId != null || initialReplyTargetId != null
      ? `${panelId}-comment-${initialCommentId ?? initialReplyTargetId}`
      : null;
  const initialCommentScrollKey =
    initialCommentTargetId != null
      ? `${newsId ?? ""}:${initialCommentTargetId}`
      : null;
  const commentListStyle = {
    "--newsroll-comment-composer-height": isComposerVisible
      ? `${composerHeight}px`
      : "0px",
  } as CSSProperties;
  const commentListId = `${panelId}-comment-list`;
  const prepareInitialCommentScroll = useCallback(() => {
    const targetCommentId = initialReplyTargetId ?? initialCommentId;

    if (targetCommentId == null) {
      return;
    }

    setIsComposerVisible(true);
  }, [initialCommentId, initialReplyTargetId]);
  const deletedCommentIdSet = useMemo(
    () => new Set(deletedCommentIds),
    [deletedCommentIds],
  );
  const deletedReplyIdSet = useMemo(
    () => new Set(deletedReplyIds),
    [deletedReplyIds],
  );
  const blockedUserIdSet = useMemo(
    () =>
      new Set(
        contentActions
          .filter((action) => action.type === "block" && action.targetUserId)
          .map((action) => action.targetUserId as string),
      ),
    [contentActions],
  );
  const hiddenCommentIdSet = useMemo(
    () =>
      new Set(
        contentActions
          .filter(
            (action) =>
              action.type === "hide" && action.targetType === "comment",
          )
          .map((action) => action.targetId),
      ),
    [contentActions],
  );
  const hiddenReplyIdSet = useMemo(
    () =>
      new Set(
        contentActions
          .filter(
            (action) => action.type === "hide" && action.targetType === "reply",
          )
          .map((action) => action.targetId),
      ),
    [contentActions],
  );

  useEffect(() => {
    let ignore = false;

    userContentActionApi
      .getActions(currentUserId)
      .then((actions) => {
        if (!ignore) {
          setContentActions(actions);
        }
      })
      .catch(() => undefined);

    return () => {
      ignore = true;
    };
  }, [newsId]);
  const commentsByParentId = useMemo(() => {
    const groups: Record<string, Comment[]> = {};

    apiComments.forEach((comment) => {
      if (!comment.parentId) {
        return;
      }

      groups[comment.parentId] = [...(groups[comment.parentId] ?? []), comment];
    });

    return groups;
  }, [apiComments]);
  const allComments = useMemo(
    () =>
      apiComments
        .filter((comment) => !comment.parentId)
        .map((comment) =>
          getCommentItemFromApi(
            comment,
            guideChoices,
            pollOptionLabelById,
            commentsByParentId[comment.id]?.length ?? 0,
          ),
        )
        .map((comment) => {
          const editedBody = commentEdit.getEditedValue(comment.id);

          return editedBody ? { ...comment, body: editedBody } : comment;
        })
        .filter(
          (comment) =>
            !deletedCommentIdSet.has(comment.id) &&
            !hiddenCommentIdSet.has(comment.id) &&
            !blockedUserIdSet.has(comment.userId),
        ),
    [
      apiComments,
      blockedUserIdSet,
      commentEdit.editedValues,
      commentsByParentId,
      deletedCommentIdSet,
      guideChoices,
      hiddenCommentIdSet,
      pollOptionLabelById,
    ],
  );
  const getCommentReactionCounts = (comment: { id: string }) => {
    const counts = commentReactionCounts[comment.id] ?? emptyCommentReactionCounts;

    return {
      dislikes: counts.dislike,
      likes: counts.like,
    };
  };
  const getCommentPopularity = (comment: CommentItem) => {
    const { likes } = getCommentReactionCounts(comment);
    return likes + comment.replies;
  };
  const visibleComments = useMemo(
    () =>
      allComments
        .filter((comment) => (myCommentsOnly ? comment.isMine : true))
        .filter((comment) =>
          activeChoice === "all" ? true : comment.choice === activeChoice,
        )
        .sort((a, b) => {
          if (sortOrder === "latest") {
            return (
              new Date(b.createdAt ?? 0).getTime() -
              new Date(a.createdAt ?? 0).getTime()
            );
          }

          return (
            getCommentPopularity(b) - getCommentPopularity(a) ||
            new Date(b.createdAt ?? 0).getTime() -
              new Date(a.createdAt ?? 0).getTime()
          );
        }),
    [
      activeChoice,
      allComments,
      commentReactionCounts,
      myCommentsOnly,
      sortOrder,
    ],
  );

  function scrollArticleTo(
    articleScroller: HTMLElement,
    nextScrollTop: number,
  ) {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    articleScroller.scrollTop = nextScrollTop;

    if (
      !prefersReducedMotion &&
      typeof articleScroller.scrollTo === "function"
    ) {
      articleScroller.scrollTo({
        behavior: "smooth",
        top: nextScrollTop,
      });
    }
  }

  function getCommentScrollRoot() {
    const panel = panelRef.current;

    if (!panel) {
      return null;
    }

    const candidates = newsrollCommentScrollRootSelectors.map((selector) =>
      panel.closest(selector),
    );

    return (
      candidates.find(
        (candidate): candidate is HTMLElement =>
          candidate instanceof HTMLElement &&
          candidate.scrollHeight > candidate.clientHeight,
      ) ??
      candidates.find(
        (candidate): candidate is HTMLElement =>
          candidate instanceof HTMLElement,
      ) ??
      null
    );
  }

  function scrollElementBottomIntoView(targetId: string, bottomGap = 24) {
    const target = document.getElementById(targetId);
    const articleScroller = getCommentScrollRoot();

    if (!(articleScroller instanceof HTMLElement) || !target) {
      return false;
    }

    const scrollerRect = articleScroller.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const composerRect = document
      .getElementById(composerId)
      ?.getBoundingClientRect();
    const visibleBottom = composerRect
      ? Math.min(scrollerRect.bottom, composerRect.top)
      : scrollerRect.bottom;
    const targetScrollTop =
      articleScroller.scrollTop + targetRect.bottom - visibleBottom + bottomGap;
    const nextScrollTop = Math.min(
      Math.max(0, articleScroller.scrollHeight - articleScroller.clientHeight),
      Math.max(0, targetScrollTop),
    );

    scrollArticleTo(articleScroller, nextScrollTop);
    return true;
  }

  const closeCommentActionMenus = useCallback(() => {
    setIsCommentSortOpen(false);
    setOpenCommentActionId(null);
    setOpenReplyActionId(null);
  }, []);

  useActionMenuDismiss({
    enabled:
      isCommentSortOpen ||
      openCommentActionId !== null ||
      openReplyActionId !== null,
    ignoreSelector: ".wrapper_dropdownSelect, .wrapper_commentAction",
    onDismiss: closeCommentActionMenus,
  });

  useEffect(() => {
    const panel = panelRef.current;

    if (!panel) {
      return;
    }

    const scrollRoot = panel.closest(newsrollArticleContentScrollerSelector);
    const card = scrollRoot?.closest(newsrollArticleCardSelector);
    const feedScroller = card?.closest(newsrollNewsFeedSelector);
    const updateComposerVisibility = () => {
      if (!(scrollRoot instanceof HTMLElement)) {
        setIsComposerVisible(false);
        return;
      }

      const panelRect = panel.getBoundingClientRect();
      const rootRect = scrollRoot.getBoundingClientRect();
      const hasVisibleOverlap =
        panelRect.bottom > rootRect.top && panelRect.top < rootRect.bottom;

      setIsComposerVisible(hasVisibleOverlap);
    };

    updateComposerVisibility();
    if (scrollRoot instanceof HTMLElement) {
      scrollRoot.addEventListener("scroll", updateComposerVisibility, {
        passive: true,
      });
    }
    if (feedScroller instanceof HTMLElement && feedScroller !== scrollRoot) {
      feedScroller.addEventListener("scroll", updateComposerVisibility, {
        passive: true,
      });
    }
    window.addEventListener("resize", updateComposerVisibility);

    return () => {
      if (scrollRoot instanceof HTMLElement) {
        scrollRoot.removeEventListener("scroll", updateComposerVisibility);
      }
      if (feedScroller instanceof HTMLElement && feedScroller !== scrollRoot) {
        feedScroller.removeEventListener("scroll", updateComposerVisibility);
      }
      window.removeEventListener("resize", updateComposerVisibility);
    };
  }, []);

  useEffect(() => {
    if (initialCommentTargetId == null || initialCommentScrollKey == null) {
      return;
    }

    if (initialCommentScrollKeyRef.current === initialCommentScrollKey) {
      return;
    }

    prepareInitialCommentScroll();

    if (composerHeight <= 0) {
      return;
    }

    let isCancelled = false;
    let retryTimeout = 0;

    const tryScrollToInitialComment = (attempt = 0) => {
      if (isCancelled) {
        return;
      }

      const didScroll = scrollElementBottomIntoView(
        initialCommentTargetId,
        0,
      );

      if (didScroll) {
        initialCommentScrollKeyRef.current = initialCommentScrollKey;
        return;
      }

      if (attempt >= 12) {
        return;
      }

      retryTimeout = window.setTimeout(() => {
        window.requestAnimationFrame(() => {
          tryScrollToInitialComment(attempt + 1);
        });
      }, 80);
    };

    const timeout = window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          tryScrollToInitialComment();
        });
      });
    }, commentScrollDelayMs);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeout);
      window.clearTimeout(retryTimeout);
    };
  }, [
    apiComments.length,
    composerHeight,
    expandedReplyId,
    initialCommentScrollKey,
    initialCommentTargetId,
    prepareInitialCommentScroll,
  ]);

  useEffect(() => {
    if (isComposerVisible) {
      return;
    }

    setComposerHeight(0);
    replyComposerHistoryRef.current = false;
    setComposerDraft("");
    setComposerMode("comment");
    commentEdit.cancelEdit();
    replyEdit.cancelEdit();
    setReplyTargetCommentId(null);
  }, [isComposerVisible]);

  useEffect(() => {
    function handleReplyComposerBack() {
      if (!replyComposerHistoryRef.current) {
        return;
      }

      setExpandedReplyId(null);
      resetComposer();
    }

    window.addEventListener("popstate", handleReplyComposerBack);

    return () => {
      window.removeEventListener("popstate", handleReplyComposerBack);
    };
  }, []);

  useLayoutEffect(() => {
    if (!isComposerVisible) {
      setComposerHeight(0);
      return undefined;
    }

    let animationFrame = 0;

    const measureComposer = () => {
      const composer = document.getElementById(composerId);
      const nextHeight = composer
        ? Math.ceil(composer.getBoundingClientRect().height)
        : 0;

      setComposerHeight((current) =>
        current === nextHeight ? current : nextHeight,
      );
    };

    animationFrame = window.requestAnimationFrame(measureComposer);
    window.addEventListener("resize", measureComposer);

    const composer = document.getElementById(composerId);
    const resizeObserver =
      composer && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(measureComposer)
        : null;

    if (composer && resizeObserver) {
      resizeObserver.observe(composer);
    }

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", measureComposer);
      resizeObserver?.disconnect();
    };
  }, [composerId, isComposerVisible]);

  useEffect(() => {
    if (!pendingScrollTarget) {
      return;
    }

    const scrollTarget = pendingScrollTarget;
    let isCancelled = false;
    let retryTimeout = 0;

    const scrollToPendingTarget = (attempt = 0) => {
      if (isCancelled) {
        return;
      }

      const didScroll = scrollElementBottomIntoView(
        scrollTarget.id,
        scrollTarget.bottomGap,
      );

      if (didScroll) {
        setPendingScrollTarget(null);
        return;
      }

      if (attempt >= 12) {
        setPendingScrollTarget(null);
        return;
      }

      retryTimeout = window.setTimeout(() => {
        scrollToPendingTarget(attempt + 1);
      }, 80);
    };

    const timeout = window.setTimeout(() => {
      scrollToPendingTarget();
    }, scrollTarget.delayMs ?? commentScrollDelayMs);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeout);
      window.clearTimeout(retryTimeout);
    };
  }, [pendingScrollTarget]);

  function resetComposer() {
    replyComposerHistoryRef.current = false;
    setComposerDraft("");
    setComposerMode("comment");
    commentEdit.cancelEdit();
    replyEdit.cancelEdit();
    setReplyTargetCommentId(null);
  }

  function activateReplyComposer(commentId: CommentId) {
    commentEdit.cancelEdit();
    replyEdit.cancelEdit();
    setReplyTargetCommentId(commentId);
    setComposerMode("reply");
    setComposerDraft("");

    if (!replyComposerHistoryRef.current) {
      window.history.pushState(
        { newsrollReplyComposer: true },
        "",
        window.location.href,
      );
      replyComposerHistoryRef.current = true;
    }
  }

  function deactivateReplyComposer(shouldRestoreHistory = false) {
    const shouldGoBack = shouldRestoreHistory && replyComposerHistoryRef.current;

    resetComposer();

    if (shouldGoBack) {
      window.history.back();
    }
  }

  function startEditComment(commentId: CommentId) {
    const targetComment = allComments.find(
      (comment) => comment.id === commentId && comment.isMine,
    );

    if (!targetComment) {
      return;
    }

    setReplyTargetCommentId(null);
    replyEdit.cancelEdit();
    commentEdit.beginEdit(commentId, targetComment.body);
    setComposerMode("comment");
    setComposerDraft("");
  }

  function cancelEditComment() {
    commentEdit.cancelEdit();
  }

  async function saveEditedComment() {
    const commentId = commentEdit.editingId;
    const content = commentEdit.draft.trim();

    if (!commentId || !content) {
      return;
    }

    await commentApi.updateComment(commentId, { content });
    commentEdit.saveEdit();
    await reloadComments();
  }

  function startEditReply(reply: CommentReplyItem, value: string) {
    if (!reply.isMine) {
      return;
    }

    commentEdit.cancelEdit();
    replyEdit.beginEdit(reply.id, value);
    setComposerMode("comment");
    setComposerDraft("");
  }

  function cancelEditReply() {
    replyEdit.cancelEdit();
  }

  async function saveEditedReply() {
    const replyId = replyEdit.editingId;
    const content = replyEdit.draft.trim();

    if (!replyId || !content) {
      return;
    }

    await commentApi.updateComment(replyId, { content });
    replyEdit.saveEdit();
    await reloadComments();
  }

  function toggleReplyList(commentId: CommentId, hasReplies: boolean) {
    const isClosing = expandedReplyId === commentId;

    setExpandedReplyId(isClosing ? null : commentId);

    if (isClosing && replyTargetCommentId === commentId) {
      deactivateReplyComposer(true);
      return;
    }

    if (!isClosing) {
      activateReplyComposer(commentId);
      setPendingScrollTarget({
        bottomGap: 0,
        delayMs: nextArticleRevealDelayMs,
        id: hasReplies
          ? `${panelId}-reply-list-${commentId}`
          : `${panelId}-comment-${commentId}`,
      });
    }
  }

  async function recordCommentArticleActivity() {
    if (!newsId) {
      return;
    }

    await newsApi
      .addRecentNewsView({
        newsId,
        userId: currentUserId,
      })
      .catch(() => undefined);
  }

  async function submitComposer() {
    const body = composerDraft.trim();

    if (!body || !newsId) {
      return;
    }

    if (composerMode === "reply") {
      const targetComment = allComments.find(
        (comment) => comment.id === replyTargetCommentId,
      );

      if (!targetComment) {
        resetComposer();
        return;
      }

      const createdReply = await commentApi.createComment({
        content: body,
        newsId,
        parentId: targetComment.id,
        userId: currentUserId,
      });
      await recordCommentArticleActivity();

      setPendingScrollTarget({
        bottomGap: 0,
        id: `${panelId}-reply-${createdReply.id}`,
      });
      setExpandedReplyId(targetComment.id);
      resetComposer();
      await reloadComments();
      return;
    }

    const selectedPollOptionId = Object.entries(pollOptionLabelById).find(
      ([, label]) => label === activeChoice,
    )?.[0];
    const createdComment = await commentApi.createComment({
      content: body,
      newsId,
      pollOptionId: selectedPollOptionId ?? null,
      userId: currentUserId,
    });
    await recordCommentArticleActivity();

    setPendingScrollTarget({
      bottomGap: 0,
      id: `${panelId}-comment-${createdComment.id}`,
    });
    resetComposer();
    await reloadComments();
  }

  function toggleCommentReaction(
    commentId: CommentId,
    reaction: CommentReactionValue,
  ) {
    const targetComment = apiComments.find((comment) => comment.id === commentId);
    const currentReaction = commentReactionRows[commentId] ?? null;

    if (!targetComment) {
      return;
    }

    const nextReaction = currentReaction?.type === reaction ? null : reaction;
    const likeDelta =
      (nextReaction === "like" ? 1 : 0) -
      (currentReaction?.type === "like" ? 1 : 0);
    const dislikeDelta =
      (nextReaction === "dislike" ? 1 : 0) -
      (currentReaction?.type === "dislike" ? 1 : 0);
    const currentReactionCounts = commentReactionCounts[commentId] ?? {
      ...emptyCommentReactionCounts,
    };
    const nextLikeCount = Math.max(
      0,
      currentReactionCounts.like + likeDelta,
    );
    const nextDislikeCount = Math.max(
      0,
      currentReactionCounts.dislike + dislikeDelta,
    );

    setCommentReactions((currentReactions) => ({
      ...currentReactions,
      [commentId]: nextReaction,
    }));
    setCommentReactionCounts((currentCounts) => {
      const currentCommentCounts = currentCounts[commentId] ?? {
        ...emptyCommentReactionCounts,
      };

      return {
        ...currentCounts,
        [commentId]: {
          dislike: Math.max(0, currentCommentCounts.dislike + dislikeDelta),
          like: Math.max(0, currentCommentCounts.like + likeDelta),
        },
      };
    });
    setApiComments((currentComments) =>
      currentComments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              dislikeCount: Math.max(0, comment.dislikeCount + dislikeDelta),
              likeCount: Math.max(0, comment.likeCount + likeDelta),
            }
          : comment,
      ),
    );

    void (async () => {
      if (!nextReaction && currentReaction) {
        await commentApi.removeCommentReaction(currentReaction.id);
      } else if (nextReaction && currentReaction) {
        await commentApi.updateCommentReaction(currentReaction.id, nextReaction);
      } else if (nextReaction) {
        await commentApi.addCommentReaction({
          commentId,
          type: nextReaction,
          userId: currentUserId,
        });
      }

      await commentApi.updateCommentReactionCounts(commentId, {
        dislikeCount: nextDislikeCount,
        likeCount: nextLikeCount,
      });
      await reloadComments();
    })();
  }

  function addContentAction(action: UserContentAction) {
    setContentActions((currentActions) =>
      currentActions.some((currentAction) => currentAction.id === action.id)
        ? currentActions
        : [action, ...currentActions],
    );
  }

  function hideTargetContent(targetId: string, targetType: "comment" | "reply") {
    if (targetType === "comment") {
      setDeletedCommentIds((currentIds) =>
        currentIds.includes(targetId) ? currentIds : [...currentIds, targetId],
      );
      setExpandedReplyId((currentId) => (currentId === targetId ? null : currentId));
      if (replyTargetCommentId === targetId) {
        resetComposer();
      }
      return;
    }

    setDeletedReplyIds((currentIds) =>
      currentIds.includes(targetId) ? currentIds : [...currentIds, targetId],
    );
  }

  function blockUserContent(targetUserId: string) {
    const targetCommentIds = apiComments
      .filter(
        (comment) => comment.userId === targetUserId && comment.parentId === null,
      )
      .map((comment) => comment.id);
    const targetReplyIds = apiComments
      .filter(
        (comment) => comment.userId === targetUserId && comment.parentId !== null,
      )
      .map((comment) => comment.id);

    setDeletedCommentIds((currentIds) =>
      Array.from(new Set([...currentIds, ...targetCommentIds])),
    );
    setDeletedReplyIds((currentIds) =>
      Array.from(new Set([...currentIds, ...targetReplyIds])),
    );
    if (replyTargetCommentId) {
      const replyTarget = apiComments.find(
        (comment) => comment.id === replyTargetCommentId,
      );

      if (replyTarget?.userId === targetUserId) {
        resetComposer();
      }
    }
  }

  function saveCommentModerationAction({
    action,
    reason,
    targetId,
    targetType,
    targetUserId,
  }: CommentReportTarget & { action: "block" | "hide" | "report"; reason?: string }) {
    return userContentActionApi
      .createAction({
        newsId,
        reason,
        targetId,
        targetType,
        targetUserId,
        type: action,
        userId: currentUserId,
      })
      .then((createdAction) => {
        addContentAction(createdAction);
        return createdAction;
      });
  }

  function openReportDialog(target: CommentReportTarget) {
    setReportTarget(target);
    setReportReason(commentReportReasons[0]);
    setIsReportReasonOpen(false);
  }

  function submitReport() {
    if (!reportTarget) {
      return;
    }

    setIsReportSubmitting(true);
    saveCommentModerationAction({
      ...reportTarget,
      action: "report",
      reason: reportReason,
    })
      .then(() => {
        setReportTarget(null);
        setModerationConfirmMessage("신고되었습니다.");
      })
      .finally(() => {
        setIsReportSubmitting(false);
      });
  }

  function handleCommentAction(commentId: CommentId, action: CommentAction) {
    setOpenCommentActionId(null);
    setOpenReplyActionId(null);

    if (action === "delete") {
      void commentApi.deleteComment(commentId).then(reloadComments);
      setDeletedCommentIds((currentIds) =>
        currentIds.includes(commentId)
          ? currentIds
          : [...currentIds, commentId],
      );
      setExpandedReplyId((currentId) =>
        currentId === commentId ? null : currentId,
      );
      if (replyTargetCommentId === commentId) {
        resetComposer();
      }
      commentEdit.clearEdit(commentId);
      setCommentReactions((currentReactions) => {
        const { [commentId]: _deletedReaction, ...nextReactions } =
          currentReactions;

        return nextReactions;
      });
      return;
    }

    if (action === "edit") {
      startEditComment(commentId);
      return;
    }

    if (action === "report" || action === "block" || action === "hide") {
      const targetComment = apiComments.find((comment) => comment.id === commentId);

      if (!targetComment || targetComment.userId === currentUserId) {
        return;
      }

      const target = {
        targetId: commentId,
        targetType: "comment",
        targetUserId: targetComment.userId,
      } as const;

      if (action === "report") {
        openReportDialog(target);
        return;
      }

      void saveCommentModerationAction({
        ...target,
        action,
      }).then(() => {
        if (action === "hide") {
          hideTargetContent(commentId, "comment");
          setModerationConfirmMessage("숨김처리되었습니다.");
          return;
        }

        blockUserContent(targetComment.userId);
        setModerationConfirmMessage("차단되었습니다.");
      });
      }
  }

  function handleReplyAction(reply: CommentReplyItem, action: CommentAction) {
    setOpenReplyActionId(null);

    if (action === "delete") {
      void commentApi.deleteComment(reply.id).then(reloadComments);
      setDeletedReplyIds((currentIds) =>
        currentIds.includes(reply.id) ? currentIds : [...currentIds, reply.id],
      );
      replyEdit.clearEdit(reply.id);
      return;
    }

    if (action === "edit") {
      startEditReply(reply, replyEdit.getEditedValue(reply.id) ?? reply.body);
      return;
    }

    if (action === "report" || action === "block" || action === "hide") {
      if (!reply.userId || reply.userId === currentUserId) {
        return;
      }

      const target = {
        targetId: reply.id,
        targetType: "reply",
        targetUserId: reply.userId,
      } as const;

      if (action === "report") {
        openReportDialog(target);
        return;
      }

      void saveCommentModerationAction({
        ...target,
        action,
      }).then(() => {
        if (action === "hide") {
          hideTargetContent(reply.id, "reply");
          setModerationConfirmMessage("숨김처리되었습니다.");
          return;
        }

        blockUserContent(target.targetUserId);
        setModerationConfirmMessage("차단되었습니다.");
      });
    }
  }

  return (
    <>
      <section
        className="wrapper_commentPanel motion_enterUp"
        id={id}
        ref={panelRef}
        aria-label="댓글 반응"
      >
        <div className="wrapper_commentSummary wrapper_betweenRow">
          <span className="text_commentTotal">댓글 {allComments.length}</span>
          <TextButton
            aria-pressed={myCommentsOnly}
            onClick={() => {
              setMyCommentsOnly((current) => !current);
              setActiveChoice(commentTabs[0].id);
            }}
            type="button"
          >
            나의 댓글
          </TextButton>
        </div>

        <section
          className="container_commentGuide"
          aria-label="안내 선택지별 댓글"
        >
          <div className="wrapper_commentGuideTabs">
            <h3>투표 선택지 별</h3>
            <PillTabMenu
              ariaLabel="안내 선택지별 댓글 필터"
              className="wrapper_commentTabs wrapper_tabScroller"
              items={commentTabs}
              onChange={setActiveChoice}
              value={activeChoice}
            />
          </div>

          <div className="wrapper_commentGuideComments">
            <SelectButton
              ariaLabel="댓글 정렬"
              isOpen={isCommentSortOpen}
              listboxId={commentSortMenuId}
              onChange={setSortOrder}
              onOpenChange={(nextOpen) => {
                setOpenCommentActionId(null);
                setOpenReplyActionId(null);
                setIsCommentSortOpen(nextOpen);
              }}
              options={commentSortOptions}
              value={sortOrder}
            />

            <div
              className="wrapper_commentList wrapper_scrollList"
              id={commentListId}
              style={commentListStyle}
            >
              {visibleComments.length > 0 ? (
                visibleComments.map((comment, index) => {
                  const selectedReaction = commentReactions[comment.id] ?? null;
                  const { dislikes: dislikeCount, likes: likeCount } =
                    getCommentReactionCounts(comment);
                  const actionMenuId = `${panelId}-comment-action-${comment.id}`;
                  const commentActions = comment.isMine
                    ? myCommentActionOptions
                    : otherCommentActionOptions;
                  const replyToggleId = `${panelId}-reply-toggle-${comment.id}`;
                  const replyListId = `${panelId}-reply-list-${comment.id}`;
                  const isReplyListOpen = expandedReplyId === comment.id;
                  const isEditingComment =
                    commentEdit.editingId === comment.id;
                  const commentReplies = (commentsByParentId[comment.id] ?? [])
                    .map((reply) => ({
                      author: getCommentAuthor(reply.userId),
                      body: reply.content,
                      choice: getCommentChoice(
                        reply,
                        guideChoices,
                        pollOptionLabelById,
                      ),
                      date: formatCommentDate(reply.createdAt),
                      dislikes: reply.dislikeCount,
                      id: reply.id,
                      isMine: reply.userId === currentUserId,
                      likes: reply.likeCount,
                      userId: reply.userId,
                    }))
                    .filter(
                      (reply) =>
                        !deletedReplyIdSet.has(reply.id) &&
                        !hiddenReplyIdSet.has(reply.id) &&
                        !blockedUserIdSet.has(reply.userId),
                    );
                  const hasCommentReplies = commentReplies.length > 0;

                  return (
                    <Fragment key={comment.id}>
                      {index > 0 ? (
                        <Divider className="divider_commentItem" />
                      ) : null}
                      <article
                        className="wrapper_commentItem"
                        id={`${panelId}-comment-${comment.id}`}
                      >
                        <header>
                          <span className="wrapper_commentMeta">
                            <strong>{comment.author}</strong>
                            <NewsCreatedTime>{comment.date}</NewsCreatedTime>
                          </span>
                          <ActionMenu
                            buttonLabel="댓글 더보기"
                            isOpen={openCommentActionId === comment.id}
                            menuClassName="listbox_commentActionMenu listbox_commentAction"
                            menuId={actionMenuId}
                            onOpenChange={(nextIsOpen) => {
                                setIsCommentSortOpen(false);
                                setOpenReplyActionId(null);
                                setOpenCommentActionId(
                                  nextIsOpen ? comment.id : null,
                                );
                              }}
                            onSelect={(action) =>
                              handleCommentAction(comment.id, action)
                            }
                            options={commentActions}
                          />
                        </header>
                        <ChipLabel>
                          {comment.choice}
                        </ChipLabel>
                        {isEditingComment ? (
                          <CommentInlineEditor
                            ariaLabel="댓글 수정"
                            onCancel={cancelEditComment}
                            onChange={commentEdit.setDraft}
                            onSave={saveEditedComment}
                            value={commentEdit.draft}
                          />
                        ) : (
                          <p>{comment.body}</p>
                        )}
                        <footer>
                          <TextButton
                            aria-controls={
                              hasCommentReplies && isReplyListOpen
                                ? replyListId
                                : undefined
                            }
                            aria-expanded={
                              hasCommentReplies ? isReplyListOpen : undefined
                            }
                            id={replyToggleId}
                            onClick={() =>
                              toggleReplyList(comment.id, hasCommentReplies)
                            }
                            type="button"
                          >
                            대댓글 {commentReplies.length}
                          </TextButton>
                          <span>
                            <IconTextButton
                              aria-label="댓글 좋아요"
                              aria-pressed={selectedReaction === "like"}
                              icon="thumbUp"
                              onClick={() =>
                                toggleCommentReaction(comment.id, "like")
                              }
                              tone="like"
                              size="small"
                            >
                              {getVisibleReactionCount(likeCount)}
                            </IconTextButton>
                            <IconTextButton
                              aria-label="댓글 싫어요"
                              aria-pressed={selectedReaction === "dislike"}
                              icon="thumbDown"
                              onClick={() =>
                                toggleCommentReaction(comment.id, "dislike")
                              }
                              tone="dislike"
                              size="small"
                            >
                              {getVisibleReactionCount(dislikeCount)}
                            </IconTextButton>
                          </span>
                        </footer>
                        {hasCommentReplies && isReplyListOpen ? (
                          <div
                            aria-hidden={false}
                            aria-labelledby={replyToggleId}
                            className="wrapper_commentReplies is_open"
                            id={replyListId}
                            role="region"
                          >
                            <div className="wrapper_commentRepliesInner">
                              {commentReplies.map((reply, replyIndex) => {
                              const replyActionMenuId = `${panelId}-reply-action-${reply.id}`;
                              const replyActions = reply.isMine
                                ? myCommentActionOptions
                                : otherCommentActionOptions;
                              const isEditingReply =
                                replyEdit.editingId === reply.id;
                              const replyBody =
                                replyEdit.getEditedValue(reply.id) ??
                                reply.body;
                              const selectedReplyReaction =
                                commentReactions[reply.id] ?? null;
                              const {
                                dislikes: replyDislikeCount,
                                likes: replyLikeCount,
                              } = getCommentReactionCounts(reply);

                              return (
                                <Fragment key={reply.id}>
                                  <article
                                    className="wrapper_commentReplyItem"
                                    id={`${panelId}-reply-${reply.id}`}
                                  >
                                    <header>
                                      <span className="wrapper_commentMeta">
                                        <strong>{reply.author}</strong>
                                        <NewsCreatedTime>
                                          {reply.date}
                                        </NewsCreatedTime>
                                      </span>
                                      <ActionMenu
                                        buttonLabel="대댓글 더보기"
                                        disabled={!isReplyListOpen}
                                        isOpen={openReplyActionId === reply.id}
                                        menuClassName="listbox_commentActionMenu listbox_commentAction"
                                        menuId={replyActionMenuId}
                                        onOpenChange={(nextIsOpen) => {
                                            setIsCommentSortOpen(false);
                                            setOpenCommentActionId(null);
                                            setOpenReplyActionId(
                                              nextIsOpen ? reply.id : null,
                                            );
                                          }}
                                        onSelect={(action) =>
                                          handleReplyAction(reply, action)
                                        }
                                        options={replyActions}
                                      />
                                    </header>
                                    <ChipLabel>
                                      {reply.choice}
                                    </ChipLabel>
                                    {isEditingReply ? (
                                      <CommentInlineEditor
                                        ariaLabel="대댓글 수정"
                                        onCancel={cancelEditReply}
                                        onChange={replyEdit.setDraft}
                                        onSave={saveEditedReply}
                                        value={replyEdit.draft}
                                      />
                                    ) : (
                                      <p>{replyBody}</p>
                                    )}
                                    <footer>
                                      <span>
                                        <IconTextButton
                                          aria-label="대댓글 좋아요"
                                          aria-pressed={
                                            selectedReplyReaction === "like"
                                          }
                                          icon="thumbUp"
                                          onClick={() =>
                                            toggleCommentReaction(reply.id, "like")
                                          }
                                          tone="like"
                                          size="small"
                                        >
                                          {getVisibleReactionCount(replyLikeCount)}
                                        </IconTextButton>
                                        <IconTextButton
                                          aria-label="대댓글 싫어요"
                                          aria-pressed={
                                            selectedReplyReaction === "dislike"
                                          }
                                          icon="thumbDown"
                                          onClick={() =>
                                            toggleCommentReaction(
                                              reply.id,
                                              "dislike",
                                            )
                                          }
                                          tone="dislike"
                                          size="small"
                                        >
                                          {getVisibleReactionCount(replyDislikeCount)}
                                        </IconTextButton>
                                      </span>
                                    </footer>
                                  </article>
                                  {replyIndex < commentReplies.length - 1 ? (
                                    <Divider className="divider_commentItem" />
                                  ) : null}
                                </Fragment>
                              );
                              })}
                            </div>
                          </div>
                        ) : null}
                      </article>
                    </Fragment>
                  );
                })
              ) : commentLoadFailed ? (
                <DataUnavailableMessage target="댓글" />
              ) : (
                <p className="text_commentEmpty">표시할 댓글이 없습니다.</p>
              )}
            </div>
          </div>
        </section>
      </section>
      {reportTarget ? (
        <ClientPortal>
          <div
            className="container_dialog"
            onClick={() => setReportTarget(null)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="wrapper_dialogContent"
              onClick={(event) => event.stopPropagation()}
            >
              <h3 className="text_myDialogTitle">신고 사유 선택</h3>
              <label className="wrapper_contentMeta wrapper_fieldStack u_w100">
                <span className="text_infoFieldLabel">신고 경위</span>
                <SelectButton
                  ariaLabel="신고 경위"
                  isOpen={isReportReasonOpen}
                  listboxId={`${panelId}-report-reason-menu`}
                  onChange={setReportReason}
                  onOpenChange={setIsReportReasonOpen}
                  options={commentReportReasons.map((reason) => ({
                    label: reason,
                    value: reason,
                  }))}
                  size="default"
                  value={reportReason}
                />
              </label>
              <PrimaryButtonGroup columns={2}>
                <PrimaryButton
                  disabled={isReportSubmitting}
                  onClick={() => setReportTarget(null)}
                  tone="neutral"
                  type="button"
                >
                  취소
                </PrimaryButton>
                <PrimaryButton
                  disabled={isReportSubmitting}
                  onClick={submitReport}
                  type="button"
                >
                  {isReportSubmitting ? "신고 중" : "신고하기"}
                </PrimaryButton>
              </PrimaryButtonGroup>
            </div>
          </div>
        </ClientPortal>
      ) : null}
      {moderationConfirmMessage ? (
        <ConfirmDialog
          message={moderationConfirmMessage}
          onConfirm={() => setModerationConfirmMessage("")}
        />
      ) : null}
      {isComposerVisible ? (
        <BottomFixedActionBar
          ariaLabel={composerMode === "reply" ? "대댓글 작성" : "댓글 작성"}
          id={composerId}
        >
          <form
            className="form_commentComposer"
            onSubmit={(event) => {
              event.preventDefault();
              submitComposer();
            }}
          >
            <TextInput
              aria-label={composerMode === "reply" ? "대댓글 입력" : "댓글 입력"}
              hasEndAction
              onChange={(event) => setComposerDraft(event.target.value)}
              placeholder={
                composerMode === "reply"
                  ? "대댓글을 입력해 주세요."
                  : "홍길동님은 어떻게 생각하시나요?"
              }
              rightSlot={
                <IconButton
                  className="btn_commentSubmit"
                  icon="submit"
                  label={composerMode === "reply" ? "대댓글 등록" : "댓글 등록"}
                  type="submit"
                />
              }
              type="text"
              value={composerDraft}
            />
          </form>
        </BottomFixedActionBar>
      ) : null}
    </>
  );
}

export function ClientPortal({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return createPortal(children, document.body);
}

export function HomeReelCard({
  article,
  commentPanelOpen,
  framed = true,
  headingLevel = "h2",
  index,
  initialCommentId,
  initialReplyTargetId,
  initialSearchQuery,
  initialSearchTargetKey,
  initialScrollTarget,
  onCommentPanelOpenChange,
  recordRecentOnView = true,
}: {
  article: HomeArticle;
  commentPanelOpen?: boolean;
  framed?: boolean;
  headingLevel?: "h1" | "h2";
  index: number | string;
  initialCommentId?: CommentId;
  initialReplyTargetId?: CommentId;
  initialSearchQuery?: string;
  initialSearchTargetKey?: string;
  initialScrollTarget?: ArticleDetailOpenOptions["scrollTarget"];
  onCommentPanelOpenChange?: (open: boolean) => void;
  recordRecentOnView?: boolean;
}) {
  const { isBookmarked, toggleBookmark } = useBookmarkTarget({
    onAfterAdd: recordArticleActivity,
    targetId: article.id,
    targetType: "news",
  });
  const [internalCommentPanelOpen, setInternalCommentPanelOpen] = useState(
    initialCommentId != null || initialReplyTargetId != null,
  );
  const {
    articleReactionCounts,
    reaction,
    toggleArticleReaction,
  } = useArticleReaction({
    newsId: article.id,
    onAfterChange: recordArticleActivity,
  });
  const [isMiniReactionCardVisible, setIsMiniReactionCardVisible] = useState(false);
  const [isArticleReactionReached, setIsArticleReactionReached] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const articleReactionRef = useRef<HTMLDivElement>(null);
  const hasTrackedViewRef = useRef(false);
  const numericIndex = typeof index === "number" ? index : 0;
  const commentPanelId = `home-comment-panel-${index}`;
  const articleContentId = `home-article-content-${index}`;
  const articleGuideId = `home-article-guide-${index}`;
  const articleTitleId = `home-article-title-${index}`;
  const articleBodyParagraphs = getSearchTextParagraphs(article.body ?? articleBody);
  const articleBodySearchIndex = initialSearchTargetKey?.startsWith("body-")
    ? Number(initialSearchTargetKey.replace("body-", ""))
    : initialSearchTargetKey === "body" && initialSearchQuery?.trim()
      ? articleBodyParagraphs.findIndex((paragraph) =>
          paragraph
            .toLocaleLowerCase("ko-KR")
            .includes(initialSearchQuery.trim().toLocaleLowerCase("ko-KR")),
        )
      : -1;
  const articleSearchTargetKey =
    initialSearchTargetKey?.startsWith("body") && articleBodySearchIndex >= 0
      ? `body-${articleBodySearchIndex}`
      : initialSearchTargetKey;
  const articleSearchTargetId = getSearchHighlightTargetId(
    articleContentId,
    articleSearchTargetKey,
  );
  const isArticleBodySearchTarget = initialSearchTargetKey?.startsWith("body");
  const ArticleTitle = headingLevel;
  const shareArticle = useShareContent({
    text: article.body ?? article.title,
    title: article.title,
  });
  const isCommentPanelOpen =
    commentPanelOpen ?? internalCommentPanelOpen;
  const setCommentPanelOpen = useCallback(
    (nextOpen: boolean | ((currentOpen: boolean) => boolean)) => {
      const resolvedOpen =
        typeof nextOpen === "function"
          ? nextOpen(isCommentPanelOpen)
          : nextOpen;

      if (commentPanelOpen === undefined) {
        setInternalCommentPanelOpen(resolvedOpen);
      }
      onCommentPanelOpenChange?.(resolvedOpen);
    },
    [commentPanelOpen, isCommentPanelOpen, onCommentPanelOpenChange],
  );

  function scrollCommentPanelOpenHint() {
    window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        const scroller = document.getElementById(articleContentId);

        if (!(scroller instanceof HTMLElement)) {
          return;
        }

        const maxScroll = Math.max(0, scroller.scrollHeight - scroller.clientHeight);

        if (maxScroll <= 0) {
          return;
        }

        const nextScrollTop = Math.min(
          maxScroll,
          scroller.scrollTop + commentPanelOpenHintOffset,
        );
        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

        scroller.scrollTo({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          top: nextScrollTop,
        });
      });
    }, commentScrollDelayMs);
  }

  function handleCommentPanelToggle() {
    if (!isCommentPanelOpen) {
      scrollCommentPanelOpenHint();
    }

    setCommentPanelOpen((current) => !current);
  }


  useEffect(() => {
    hasTrackedViewRef.current = false;
  }, [article.id]);

  useEffect(() => {
    if (!article.id || hasTrackedViewRef.current) {
      return;
    }

    function trackView() {
      if (!article.id || hasTrackedViewRef.current) {
        return;
      }

      hasTrackedViewRef.current = true;
      const recentViewRequest = recordRecentOnView
        ? newsApi.addRecentNewsView({
            newsId: article.id,
            userId: currentUserId,
          })
        : Promise.resolve(undefined);

      recentViewRequest.catch(() => undefined);
    }

    if (!framed) {
      trackView();
      return;
    }

    const target = cardRef.current;

    if (!target || typeof IntersectionObserver === "undefined") {
      trackView();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5)) {
          trackView();
          observer.disconnect();
        }
      },
      { threshold: [0.5] },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [article.id, framed, recordRecentOnView]);


  useEffect(() => {
    if (!framed) {
      setIsMiniReactionCardVisible(false);
      return;
    }

    const target = cardRef.current;

    if (!target || typeof IntersectionObserver === "undefined") {
      setIsMiniReactionCardVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsMiniReactionCardVisible(
          Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.55),
        );
      },
      { threshold: [0, 0.55, 0.75] },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [article.id, framed]);

  useEffect(() => {
    if (!framed) {
      setIsArticleReactionReached(false);
      return;
    }

    const scroller = document.getElementById(articleContentId);
    const target = articleReactionRef.current;

    if (!(scroller instanceof HTMLElement) || !target) {
      setIsArticleReactionReached(false);
      return;
    }

    const scrollerNode = scroller;
    const targetNode = target;

    function updateArticleReactionReached() {
      const scrollerRect = scrollerNode.getBoundingClientRect();
      const targetRect = targetNode.getBoundingClientRect();

      setIsArticleReactionReached(targetRect.top <= scrollerRect.bottom);
    }

    updateArticleReactionReached();
    scrollerNode.addEventListener("scroll", updateArticleReactionReached, {
      passive: true,
    });
    window.addEventListener("resize", updateArticleReactionReached);

    return () => {
      scrollerNode.removeEventListener("scroll", updateArticleReactionReached);
      window.removeEventListener("resize", updateArticleReactionReached);
    };
  }, [article.id, articleContentId, framed, isCommentPanelOpen]);

  async function recordArticleActivity() {
    if (!article.id) {
      return;
    }

    await newsApi
      .addRecentNewsView({
        newsId: article.id,
        userId: currentUserId,
      })
      .catch(() => undefined);
  }


  useEffect(() => {
    if (initialCommentId == null && initialReplyTargetId == null) {
      return;
    }

    setCommentPanelOpen(true);
  }, [initialCommentId, initialReplyTargetId, setCommentPanelOpen]);
  useDeferredDetailScroll({
    bottomGap: 80,
    delayMs: commentScrollDelayMs,
    enabled: initialScrollTarget === "poll",
    resetKey: article.id ?? article.title,
    targetId: initialScrollTarget === "poll" ? articleGuideId : null,
  });

  useEffect(() => {
    if (
      initialScrollTarget !== "bodySearch" ||
      !initialSearchTargetKey ||
      !initialSearchQuery?.trim()
    ) {
      return;
    }

    scrollSearchHighlightTargetIntoView(articleSearchTargetId);
  }, [
    articleSearchTargetId,
    initialScrollTarget,
    initialSearchQuery,
    initialSearchTargetKey,
  ]);

  const isMiniArticleReactionVisible =
    framed && isMiniReactionCardVisible && !isArticleReactionReached;

  const articleContent = (
    <div
      aria-labelledby={articleTitleId}
      className="wrapper_articleCardContent wrapper_panelContent u_minH0"
      id={articleContentId}
      role="region"
      tabIndex={0}
    >
      <div className="wrapper_contentMeta">
        <div
          className="wrapper_articleKicker wrapper_betweenRow"
        >
          <ChipLabel>
            <SearchHighlightText
              query={
                initialSearchTargetKey === "category" ? initialSearchQuery : ""
              }
              targetId={
                initialSearchTargetKey === "category"
                  ? getSearchHighlightTargetId(articleContentId, "category")
                  : undefined
              }
            >
              {article.category}
            </SearchHighlightText>
          </ChipLabel>
        </div>
        <ArticleTitle id={articleTitleId}>
          <SearchHighlightText
            query={initialSearchTargetKey === "title" ? initialSearchQuery : ""}
            targetId={
              initialSearchTargetKey === "title"
                ? getSearchHighlightTargetId(articleContentId, "title")
                : undefined
            }
          >
            {article.title}
          </SearchHighlightText>
        </ArticleTitle>
        <div className="wrapper_articleMetaActions wrapper_betweenRow">
          <HomeArticleMeta
            date={article.date}
            dateTime={article.dateTime}
          />
          <div className="wrapper_articleActions wrapper_actionGroup u_itemsCenter" aria-label="기사 도구" role="group">
            <IconButton
              icon="share"
              label="공유"
              onClick={() => {
                void shareArticle();
              }}
              variant="articleTool"
            />
            <IconButton
              aria-pressed={isBookmarked}
              icon="bookmark"
              label="북마크"
              onClick={() => {
                void toggleBookmark();
              }}
              variant="articleTool"
            />
          </div>
        </div>
      </div>
      <img alt={article.imageAlt} src={article.image} />
      <section className="wrapper_articleBody" aria-label="기사 본문">
        {articleBodyParagraphs.map((paragraph, paragraphIndex) => {
          const paragraphTargetKey = `body-${paragraphIndex}`;
          return (
            <p className="text_articleBody" key={`${article.id ?? article.title}-body-${paragraphIndex}`}>
              <SearchHighlightText
                query={isArticleBodySearchTarget ? initialSearchQuery : ""}
                targetId={
                  articleSearchTargetKey === paragraphTargetKey
                    ? getSearchHighlightTargetId(articleContentId, paragraphTargetKey)
                    : undefined
                }
              >
                {paragraph}
              </SearchHighlightText>
            </p>
          );
        })}
      </section>

      <div
        className="wrapper_articleSource"
        id={`${articleContentId}-search-source`}
      >
        <div className="wrapper_articleSourcePublisher">
          <img
            className="img_articlePublisherLogo"
            src="/icons/icon_my_page_active.svg"
            alt=""
            width={24}
            height={24}
          />
          <span className="text_articlePublisherName">
            {article.pressName ??
              (numericIndex % 2 === 0 ? "국민일보" : "중앙일보")}
          </span>
        </div>
        <Divider
          aria-hidden="true"
          className="divider_articleSource"
          orientation="vertical"
        />
        <span className="text_articleReporter">
          {article.reporterName ?? "홍길동 기자"}
        </span>
      </div>

      <ContentActionButton
        href="https://example.com/original-news"
      >
        기사 원문 보기
      </ContentActionButton>

      <ReactionControls
        counts={articleReactionCounts}
        reaction={reaction}
        rootRef={articleReactionRef}
        onReactionChange={(nextReaction) => {
          void toggleArticleReaction(nextReaction);
        }}
      />

      <ArticleGuideSection
        id={articleGuideId}
        kind={article.guideKind ?? "stacked"}
        newsId={article.id}
      />

      <PrimaryButtonGroup>
        <PrimaryButton
        aria-controls={isCommentPanelOpen ? commentPanelId : undefined}
        aria-expanded={isCommentPanelOpen}
        leftIcon={<Icon name="chat" />}
        onClick={handleCommentPanelToggle}
      >
        댓글 반응보기
        </PrimaryButton>
      </PrimaryButtonGroup>
      {isCommentPanelOpen ? (
        <CommentReactionPanel
          guideKind={article.guideKind ?? "stacked"}
          id={commentPanelId}
          initialCommentId={initialCommentId}
          initialReplyTargetId={initialReplyTargetId}
          newsId={article.id}
        />
      ) : null}
    </div>
  );

  if (!framed) {
    return articleContent;
  }

  return (
    <article
      aria-labelledby={articleTitleId}
      className="container_articleCard wrapper_panelSurface_style"
      ref={cardRef}
    >
      {articleContent}
      <MiniReactionControls
        counts={articleReactionCounts}
        isVisible={isMiniArticleReactionVisible}
        reaction={reaction}
        onReactionChange={(nextReaction) => {
          void toggleArticleReaction(nextReaction);
        }}
      />
    </article>
  );
}

export function ArticleDetailContent({
  article,
  backLabel,
  initialCommentId,
  initialReplyTargetId,
  initialSearchQuery,
  initialSearchTargetKey,
  initialScrollTarget,
  isLeaving = false,
  onBack,
}: {
  article: HomeArticle;
  backLabel?: string;
  initialCommentId?: CommentId;
  initialReplyTargetId?: CommentId;
  initialSearchQuery?: string;
  initialSearchTargetKey?: string;
  initialScrollTarget?: ArticleDetailOpenOptions["scrollTarget"];
  isLeaving?: boolean;
  onBack?: () => void;
}) {
  return (
    <NewsRollArticleDetailPanel
      ariaLabel="기사 상세"
      backLabel={backLabel}
      className={getEnterFromRightMotionClassName(isLeaving)}
      labelledBy="home-article-title-detail"
      onBack={onBack}
    >
      <HomeReelCard
        article={article}
        framed={false}
        headingLevel="h1"
        initialCommentId={initialCommentId}
        initialReplyTargetId={initialReplyTargetId}
        initialSearchQuery={initialSearchQuery}
        initialSearchTargetKey={initialSearchTargetKey}
        initialScrollTarget={initialScrollTarget}
        index="detail"
      />
    </NewsRollArticleDetailPanel>
  );
}

export function NewsRollStateCard({
  children,
  role,
}: {
  children: ReactNode;
  role?: "alert" | "status";
}) {
  return (
    <article className="container_articleCard wrapper_panelSurface_style homeStateCard">
      <div
        className="wrapper_articleCardContent wrapper_panelContent u_minH0 homeStateContent"
        role={role}
        tabIndex={0}
      >
        {children}
      </div>
    </article>
  );
}


type AllNewsPanelContentProps = HTMLAttributes<HTMLDivElement>;

function AllNewsPanelContent({
  children,
  className,
  ...props
}: AllNewsPanelContentProps) {
  const classNames = ["all_panelContent", "wrapper_panelContent", "u_minH0", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames} {...props}>
      {children}
    </div>
  );
}

type AllNewsSectionPanelProps = {
  ariaLabel: string;
  children: ReactNode;
  className: string;
  contentProps?: AllNewsPanelContentProps;
  headingLevel?: "h1" | "h2";
  title: ReactNode;
};

export function AllNewsSectionPanel({
  ariaLabel,
  children,
  className,
  contentProps,
  headingLevel = "h2",
  title,
}: AllNewsSectionPanelProps) {
  const Heading = headingLevel;

  return (
    <article
      className={`container_articleCard wrapper_panelSurface_style all_panel ${className}`}
      aria-label={ariaLabel}
    >
      <AllNewsPanelContent {...contentProps}>
        <Heading className="text_sectionTitle">{title}</Heading>
        {children}
      </AllNewsPanelContent>
    </article>
  );
}

export type AllNewsArticlePreview = {
  article?: HomeArticle;
  category?: string;
  guideKind?: GuideKind;
  image: string;
  title: string;
};

export function createAllNewsArticle(
  preview: AllNewsArticlePreview,
  fallbackCategory: string,
  index: number,
): HomeArticle {
  if (preview.article) {
    return preview.article;
  }

  return {
    category: preview.category ?? fallbackCategory,
    date: homeArticle.date,
    guideKind: preview.guideKind ?? (index % 2 === 0 ? "stacked" : "binary"),
    image: preview.image,
    imageAlt: homeArticle.imageAlt,
    title: preview.title,
  };
}

export function getAllNewsPreviewFromArticle(article: HomeArticle): AllNewsArticlePreview {
  return {
    article,
    category: article.category,
    image: article.image,
    title: article.title,
  };
}

export function groupAllNewsByValue(
  articles: HomeArticle[],
  getValue: (article: HomeArticle) => string | undefined,
) {
  return articles.reduce<Record<string, AllNewsArticlePreview[]>>(
    (groups, article) => {
      const value = getValue(article);

      if (!value) {
        return groups;
      }

      groups[value] = [...(groups[value] ?? []), getAllNewsPreviewFromArticle(article)];

      return groups;
    },
    {},
  );
}

