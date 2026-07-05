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
  type ReactNode,
  type Ref
} from "react";

import {
  commentApi,
  newsApi,
  pollApi,
  userContentActionApi,
  type Comment,
  type UserContentAction
} from "@/shared/newsroll/api";
import {
  currentUserId,
  getCurrentUserSnapshot,
} from "@/shared/newsroll/auth/current-user";
import {
  ActionMenu,
  ArticleVoteOptionButton,
  NoticeCardLink,
  ChipLabel,
  Icon,
  IconButton,
  Divider,
  ContentActionButton,
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
import {
  type Reaction,
  type ReactionValue,
} from "@/features/news/article/article-reactions";
export { getVisibleReactionCount } from "@/features/news/article/article-reactions";
import { NewsCreatedTime } from "@/features/news/article/NewsCreatedTime";
import { ArticleGuideSection } from "@/features/news/article/ArticleGuideSection";
import { NewsRollStateCard } from "@/features/news/article/NewsRollStateCard";
export { NewsRollStateCard } from "@/features/news/article/NewsRollStateCard";
import { AllNewsSectionPanel } from "@/features/news/all-news/AllNewsSectionPanel";
import {
  getAllNewsPreviewFromArticle,
  type AllNewsArticlePreview,
} from "@/features/news/all-news/all-news-model";
export {
  getAllNewsPreviewFromArticle,
  groupAllNewsByValue,
} from "@/features/news/all-news/all-news-model";
export type { AllNewsArticlePreview } from "@/features/news/all-news/all-news-model";
export { NewsCreatedTime } from "@/features/news/article/NewsCreatedTime";
export { AllNewsSectionPanel } from "@/features/news/all-news/AllNewsSectionPanel";
import {
  articleImage,
  binaryGuideOptions,
  defaultNewsDateLabel,
  defaultNewsDateTime,
  filterArticlesByBlockedKeywords,
  formatHeroCount,
  getBreakingNewsItems,
  getHomeArticleFromNews,
  getLatestBreakingNewsItem,
  guideOptions,
} from "@/features/news/model";
import type {
  ArticleDetailOpenOptions,
  BreakingNewsItem,
  BlockedKeywordSetting,
  GuideKind,
  HomeArticle,
  HomeViewMode,
  OpenArticleDetail,
  PolicyItem,
} from "@/features/news/model";
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
export {
  articleImage,
  binaryGuideOptions,
  defaultNewsDateTime,
  filterArticlesByBlockedKeywords,
  formatNewsDate,
  getBreakingNewsItems,
  getHomeArticleFromNews,
  getLatestBreakingNewsItem,
  guideOptions,
} from "@/features/news/model";
export type {
  ArticleDetailOpenOptions,
  BlockedKeywordSetting,
  HomeArticle,
  HomeViewMode,
  OpenArticleDetail,
  PolicyItem,
} from "@/features/news/model";
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

export { ArticleVoteOptionButton };

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


