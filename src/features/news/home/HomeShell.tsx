"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { NoticeCardLink, NewsViewToggle } from "@/design-system/components";
import {
  NewsRollCommonLayout,
  NewsRollDetailBackButton,
  NewsRollDockedControls,
  NewsRollSummaryHeroTop,
  newsrollDetailRevealDelayMs as nextArticleRevealDelayMs,
  newsrollHomeDockedScrollSelectors as homeDockedScrollSelectors,
  newsrollHomeSheetDockedGap as homeSheetDockedGap,
  newsrollHomeSheetInitialGap as homeSheetInitialGap,
  newsrollHomeSheetScrollSelector as homeSheetScrollSelector,
  newsrollPagePanelInitialTop as pagePanelInitialTop,
  useDockedPanelScroll,
} from "@/design-system/templates";
import {
  formatHeroCount,
  type BreakingNewsItem,
  type HomeArticle,
  type HomeViewMode,
} from "@/features/news/model";
import { DockedAlarmButton, NewsToolbar } from "@/features/shell/NewsRollToolbar";
import { getCurrentUserSnapshot } from "@/shared/newsroll/auth/current-user";

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

const homeBreakingTitle =
  "정청래, ‘필버 중단’ 국민의 힘에 “대구/경북 통합 찬반 당론 먼저 정하라”";

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
  sheetUndockSignal,
}: HomeHeaderControls & {
  children: ReactNode;
  onPanelChange?: () => void;
  sheetUndockSignal?: number;
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
      sheetUndockSignal={sheetUndockSignal}
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
