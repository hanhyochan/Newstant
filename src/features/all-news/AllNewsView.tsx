"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type TouchEvent
} from "react";

import {
  newsApi
} from "@/app/_newsroll/api";
import {
  BreakingNewsCardLink,
  Button,
  Icon,
  PillTabMenu
} from "@/design-system/components";
import {
  NewsRollCommonLayout,
  NewsRollDetailBackButton,
  NewsRollDockedControls,
  NewsRollHeaderTop,
  newsrollHomeDockedScrollSelectors as homeDockedScrollSelectors,
  newsrollNewsFeedDetailSelector,
  newsrollDetailRevealDelayMs as nextArticleRevealDelayMs,
  newsrollPagePanelDockedGap as pagePanelDockedGap,
  newsrollPagePanelInitialGap as pagePanelInitialGap,
  newsrollPagePanelInitialTop as pagePanelInitialTop,
  useDetailScrollRestore,
  useDockedPanelScroll,
  useEnterFromRightExitMotion
} from "@/design-system/templates";
import { NewsToolbar } from "@/features/shell/NewsRollToolbar";
import { DataUnavailableMessage } from "@/features/shared/DataUnavailableMessage";
import { MoreActionButton } from "@/features/shared/MoreActionButton";
import { SeparatedList } from "@/features/shared/SeparatedList";

import {
  AllNewsHeadlineItem,
  AllNewsLatestCard,
  AllNewsRelayItem,
  AllNewsSectionPanel,
  ArticleDetailContent,
  allNewsDockedScrollSelectors,
  allNewsPresses,
  allNewsRelayCategories,
  allNewsSwipeAxisThresholdPx,
  createAllNewsArticle,
  getAllNewsPreviewFromArticle,
  getBreakingNewsItems,
  getHomeArticleFromNews,
  groupAllNewsByValue,
  homeArticle,
  type HomeArticle,
  type SwipeAxis
} from "@/features/news/NewsViews";

export function AllNewsView({
  entryMotionClassName = "",
  initialShowAllBreaking = false,
  isTextLarge,
  onOpenNotifications,
  onOpenSearch,
  onToggleTextSize,
}: {
  entryMotionClassName?: string;
  initialShowAllBreaking?: boolean;
  isTextLarge: boolean;
  onOpenNotifications: () => void;
  onOpenSearch: () => void;
  onToggleTextSize: () => void;
}) {
  const screenRef = useRef<HTMLElement>(null);
  const feedRef = useRef<HTMLElement>(null);
  const dockedPanelScroll = useDockedPanelScroll({
    boundaryDelayMs: nextArticleRevealDelayMs,
    contentScrollerSelector: allNewsDockedScrollSelectors.contentScroller,
    dockedClassName: "is_newsrollSheetDocked",
    immediatePanelSelector: allNewsDockedScrollSelectors.immediatePanel,
    panelSelector: allNewsDockedScrollSelectors.panel,
    rootRef: screenRef,
    scrollerRef: feedRef,
  });
  const [activePress, setActivePress] = useState(allNewsPresses[0]);
  const [activeRelayCategory, setActiveRelayCategory] = useState(
    allNewsRelayCategories[0],
  );
  const latestScrollerRef = useRef<HTMLDivElement>(null);
  const breakingBodyRef = useRef<HTMLDivElement>(null);
  const collapsedBreakingBodyHeightRef = useRef<number | null>(null);
  const latestDragActiveRef = useRef(false);
  const latestDidDragRef = useRef(false);
  const latestDragStartRef = useRef({ scrollLeft: 0, x: 0 });
  const latestTouchIntentRef = useRef<{
    axis: SwipeAxis | null;
    isFromLatestScroller: boolean;
    x: number;
    y: number;
  } | null>(null);
  const [isLatestDragging, setIsLatestDragging] = useState(false);
  const [detailArticle, setDetailArticle] = useState<HomeArticle | null>(null);
  const [allNewsArticles, setAllNewsArticles] = useState<HomeArticle[]>([]);
  const [showAllBreaking, setShowAllBreaking] = useState(initialShowAllBreaking);
  const [showAllHeadlines, setShowAllHeadlines] = useState(false);
  const [allNewsBreakingOffset, setAllNewsBreakingOffset] = useState(0);
  const [allNewsSheetUndockSignal, setAllNewsSheetUndockSignal] = useState(0);
  const allNewsLatestItems = useMemo(
    () => allNewsArticles.slice(0, 10).map(getAllNewsPreviewFromArticle),
    [allNewsArticles],
  );
  const allNewsHeadlinesByActivePress = useMemo(
    () => groupAllNewsByValue(allNewsArticles, (article) => article.pressName),
    [allNewsArticles],
  );
  const currentAllNewsPresses = useMemo(
    () => Object.keys(allNewsHeadlinesByActivePress),
    [allNewsHeadlinesByActivePress],
  );
  const visibleAllNewsPresses =
    currentAllNewsPresses.length > 0 ? currentAllNewsPresses : allNewsPresses;
  const allNewsRelayByActiveCategory = useMemo(
    () => groupAllNewsByValue(allNewsArticles, (article) => article.category),
    [allNewsArticles],
  );
  const currentAllNewsRelayCategories = useMemo(
    () => Object.keys(allNewsRelayByActiveCategory),
    [allNewsRelayByActiveCategory],
  );
  const visibleAllNewsRelayCategories =
    currentAllNewsRelayCategories.length > 0
      ? currentAllNewsRelayCategories
      : allNewsRelayCategories;
  const allBreakingItems = useMemo(
    () => getBreakingNewsItems(allNewsArticles),
    [allNewsArticles],
  );
  const breakingItems = showAllBreaking
    ? allBreakingItems.slice(0, 5)
    : allBreakingItems.slice(0, 3);
  const relayItems = allNewsRelayByActiveCategory[activeRelayCategory] ?? [];
  const activePressIndex = Math.max(0, visibleAllNewsPresses.indexOf(activePress));
  const activeRelayIndex = Math.max(
    0,
    visibleAllNewsRelayCategories.indexOf(activeRelayCategory),
  );
  const activeHeadlineItems = allNewsHeadlinesByActivePress[activePress] ?? [];
  const canExpandHeadlines = activeHeadlineItems.length > 4;
  const headlineItems = showAllHeadlines
    ? activeHeadlineItems
    : activeHeadlineItems.slice(0, 4);
  const allNewsMinInitialTop = pagePanelInitialTop + allNewsBreakingOffset;
  const isDetailOpen = detailArticle !== null;
  const allNewsDetailScrollRestore = useDetailScrollRestore({
    isDetailOpen,
    nestedScrollSelector: allNewsDockedScrollSelectors.contentScroller,
    scrollerRef: feedRef,
  });
  const closeAllNewsDetailImmediately = useCallback(() => {
    allNewsDetailScrollRestore.requestRestore();
    setDetailArticle(null);
  }, [allNewsDetailScrollRestore]);
  const allNewsDetailExitMotion = useEnterFromRightExitMotion({
    isOpen: isDetailOpen,
    onClose: closeAllNewsDetailImmediately,
  });

  useEffect(() => {
    let ignore = false;

    async function loadAllNews() {
      const nextNews = await newsApi.getNewsList();

      if (!ignore) {
        setAllNewsArticles(nextNews.map(getHomeArticleFromNews));
      }
    }

    loadAllNews().catch(() => {
      if (!ignore) {
        setAllNewsArticles([]);
      }
    });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!visibleAllNewsPresses.includes(activePress)) {
      setActivePress(visibleAllNewsPresses[0]);
    }
  }, [activePress, visibleAllNewsPresses]);

  useEffect(() => {
    if (!visibleAllNewsRelayCategories.includes(activeRelayCategory)) {
      setActiveRelayCategory(visibleAllNewsRelayCategories[0]);
    }
  }, [activeRelayCategory, visibleAllNewsRelayCategories]);

  useLayoutEffect(() => {
    const node = breakingBodyRef.current;

    if (!node) {
      return undefined;
    }

    const measureBreakingOffset = () => {
      const currentHeight = Math.round(node.getBoundingClientRect().height);

      if (!showAllBreaking) {
        collapsedBreakingBodyHeightRef.current = currentHeight;
        setAllNewsBreakingOffset(0);
        return;
      }

      const collapsedHeight =
        collapsedBreakingBodyHeightRef.current ?? currentHeight;
      const expansionOffset = Math.max(
        0,
        currentHeight - collapsedHeight + 24,
      );

      setAllNewsBreakingOffset(expansionOffset);
    };

    measureBreakingOffset();
    const frameId = window.requestAnimationFrame(measureBreakingOffset);
    window.addEventListener("resize", measureBreakingOffset);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", measureBreakingOffset);
    };
  }, [showAllBreaking]);

  useLayoutEffect(() => {
    if (!showAllBreaking || allNewsBreakingOffset <= 0) {
      return;
    }

    setAllNewsSheetUndockSignal((current) => current + 1);
  }, [allNewsBreakingOffset, showAllBreaking]);

  function isLatestScrollerEventTarget(target: EventTarget | null) {
    return (
      target instanceof Element &&
      target.closest(allNewsDockedScrollSelectors.latestScroller) !== null
    );
  }

  function handleAllNewsTouchStart(event: TouchEvent<HTMLElement>) {
    const touch = event.touches[0] ?? null;

    if (touch) {
      latestTouchIntentRef.current = {
        axis: null,
        isFromLatestScroller: isLatestScrollerEventTarget(event.target),
        x: touch.clientX,
        y: touch.clientY,
      };
    } else {
      latestTouchIntentRef.current = null;
    }

    dockedPanelScroll.handleTouchStart(event);
  }

  function handleAllNewsTouchMove(event: TouchEvent<HTMLElement>) {
    const touch = event.touches[0] ?? null;
    const latestTouchIntent = latestTouchIntentRef.current;

    if (touch && latestTouchIntent?.isFromLatestScroller) {
      const deltaX = touch.clientX - latestTouchIntent.x;
      const deltaY = touch.clientY - latestTouchIntent.y;
      const absoluteX = Math.abs(deltaX);
      const absoluteY = Math.abs(deltaY);

      if (
        !latestTouchIntent.axis &&
        Math.max(absoluteX, absoluteY) > allNewsSwipeAxisThresholdPx
      ) {
        latestTouchIntent.axis =
          absoluteX > absoluteY ? "horizontal" : "vertical";
      }

      if (latestTouchIntent.axis === "horizontal") {
        event.stopPropagation();
        return;
      }
    }

    dockedPanelScroll.handleTouchMove(event);
  }

  function resetLatestTouchIntent() {
    latestTouchIntentRef.current = null;
  }

  function handleLatestPointerDown(event: PointerEvent<HTMLDivElement>) {
    const node = latestScrollerRef.current;

    if (!node) {
      return;
    }

    latestDragActiveRef.current = true;
    latestDidDragRef.current = false;
    setIsLatestDragging(true);
    latestDragStartRef.current = {
      scrollLeft: node.scrollLeft,
      x: event.clientX,
    };
    node.setPointerCapture(event.pointerId);
  }

  function handleLatestPointerMove(event: PointerEvent<HTMLDivElement>) {
    const node = latestScrollerRef.current;

    if (!node || !latestDragActiveRef.current) {
      return;
    }

    const delta = event.clientX - latestDragStartRef.current.x;

    if (Math.abs(delta) > 8) {
      latestDidDragRef.current = true;
    }

    node.scrollLeft = latestDragStartRef.current.scrollLeft - delta;
  }

  function stopLatestDrag(event: PointerEvent<HTMLDivElement>) {
    const node = latestScrollerRef.current;

    latestDragActiveRef.current = false;
    setIsLatestDragging(false);

    if (node?.hasPointerCapture(event.pointerId)) {
      node.releasePointerCapture(event.pointerId);
    }

    if (!node || !latestDidDragRef.current) {
      return;
    }

    const firstCard = node.querySelector<HTMLElement>(
      ".newsroll_all_latest_card",
    );
    const cardStep = firstCard
      ? firstCard.offsetWidth +
        Number.parseFloat(
          getComputedStyle(node).columnGap || getComputedStyle(node).gap || "0",
        )
      : 1;
    const targetIndex = Math.round(node.scrollLeft / cardStep);

    node.scrollTo({
      behavior: "smooth",
      left: targetIndex * cardStep,
    });
  }

  function resetAllNewsPanelScroll(panelSelector: string) {
    const scrollToTop = () => {
      const panelContent = feedRef.current?.querySelector<HTMLElement>(
        `${panelSelector} .newsroll_all_panelContent`,
      );

      panelContent?.scrollTo({ left: 0, top: 0 });
    };

    scrollToTop();
    window.requestAnimationFrame(scrollToTop);
  }

  function changeActivePress(nextPress: string) {
    if (nextPress === activePress) {
      return;
    }

    resetAllNewsPanelScroll(".newsroll_all_press_panel");
    setShowAllHeadlines(false);
    setActivePress(nextPress);
  }

  function changeActiveRelayCategory(nextCategory: string) {
    if (nextCategory === activeRelayCategory) {
      return;
    }

    resetAllNewsPanelScroll(".newsroll_all_relay_panel");
    setActiveRelayCategory(nextCategory);
  }

  function handlePressTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const lastIndex = visibleAllNewsPresses.length - 1;
    const nextIndexByKey: Record<string, number> = {
      ArrowDown: activePressIndex === lastIndex ? 0 : activePressIndex + 1,
      ArrowLeft: activePressIndex === 0 ? lastIndex : activePressIndex - 1,
      ArrowRight: activePressIndex === lastIndex ? 0 : activePressIndex + 1,
      ArrowUp: activePressIndex === 0 ? lastIndex : activePressIndex - 1,
      End: lastIndex,
      Home: 0,
    };
    const nextIndex = nextIndexByKey[event.key];

    if (nextIndex === undefined) {
      return;
    }

    event.preventDefault();
    changeActivePress(visibleAllNewsPresses[nextIndex]);
    document.getElementById(`all-news-press-tab-${nextIndex}`)?.focus();
  }

  function openAllNewsDetail(article: HomeArticle) {
    allNewsDetailScrollRestore.captureScroll();
    setDetailArticle(article);
  }

  function showBreakingNewsList() {
    if (isDetailOpen) {
      closeAllNewsDetailImmediately();
    }

    setShowAllBreaking(true);
    setAllNewsSheetUndockSignal((current) => current + 1);
  }

  const closeAllNewsDetail = allNewsDetailExitMotion.closeWithMotion;

  return (
    <NewsRollCommonLayout
      aria-label="전체 뉴스"
      className={`newsroll_sheetFrame ${entryMotionClassName}`.trim()}
      dockedGap={pagePanelDockedGap}
      initialGap={pagePanelInitialGap}
      minInitialTop={allNewsMinInitialTop}
      lockSheetPosition={isDetailOpen}
      movingSheet
      sheetUndockSignal={allNewsSheetUndockSignal}
      onTouchCancelCapture={resetLatestTouchIntent}
      onTouchEndCapture={resetLatestTouchIntent}
      onTouchMoveCapture={isDetailOpen ? undefined : handleAllNewsTouchMove}
      onTouchStartCapture={isDetailOpen ? undefined : handleAllNewsTouchStart}
      onWheelCapture={isDetailOpen ? undefined : dockedPanelScroll.handleWheel}
      ref={screenRef}
      sheetClassName="newsroll_sheetFrameSheet container_homeSheet newsroll_all_sheetFrameSheet"
      sheetNestedScrollResetSelector={
        isDetailOpen
          ? homeDockedScrollSelectors.contentScroller
          : allNewsDockedScrollSelectors.contentScroller
      }
      sheetScrollSelector={
        isDetailOpen ? newsrollNewsFeedDetailSelector : ".newsroll_all_feed"
      }
      top={
        <NewsRollHeaderTop>
          <NewsToolbar
            isTextLarge={isTextLarge}
            onOpenNotifications={onOpenNotifications}
            onOpenSearch={onOpenSearch}
            onToggleTextSize={onToggleTextSize}
          />
          <NewsRollDockedControls
            className="newsroll_motion_dockedPop newsroll_allDockedControls newsroll_panelHeaderRow"
            isDetailOpen={isDetailOpen}
          >
            {isDetailOpen ? (
              <NewsRollDetailBackButton
                ariaLabel="전체 뉴스 목록으로 돌아가기"
                onClick={closeAllNewsDetail}
              />
            ) : (
              <h1 className="text_panelHeaderTitle">전체 뉴스</h1>
            )}
            <Button
              aria-label="속보 알림"
              aria-pressed={false}
              className="newsroll_homeDockedAlarm"
              iconOnly
              onClick={showBreakingNewsList}
              radius="full"
              size="large"
              variant="outline"
            >
              <Icon name="policy" />
            </Button>
          </NewsRollDockedControls>
          <div className="newsroll_all_breaking_label">
            <Icon name="policy" />
            <span>속보</span>
          </div>
          <div className="newsroll_all_breakingBody" ref={breakingBodyRef}>
            <div className="newsroll_all_breaking_stack" id="all-breaking-news">
              {breakingItems.length > 0 ? (
                breakingItems.map((item) => (
                  <BreakingNewsCardLink
                    id={item.id}
                    key={item.id}
                    onClick={() => openAllNewsDetail(item.article)}
                    title={item.title}
                    updatedAt={item.updatedAt}
                    variant="list"
                  />
                ))
              ) : (
                <DataUnavailableMessage target="속보" />
              )}
            </div>
            <MoreActionButton
              ariaLabel={showAllBreaking ? "속보 접기" : "속보 더보기"}
              expanded={showAllBreaking}
              onClick={() => setShowAllBreaking((current) => !current)}
              tone="dark"
            />
          </div>
        </NewsRollHeaderTop>
      }
    >
      {detailArticle ? (
        <ArticleDetailContent
          article={detailArticle}
          isLeaving={allNewsDetailExitMotion.isLeaving}
        />
      ) : (
        <section
          className="container_newsFeed newsroll_all_feed"
          aria-label="전체 뉴스 콘텐츠 영역"
          ref={feedRef}
        >
          <AllNewsSectionPanel
            ariaLabel="최신 뉴스"
            className="newsroll_all_latest_panel"
            headingLevel="h1"
            title={
              <>
                최신 뉴스 <strong>{allNewsLatestItems.length}</strong>
              </>
            }
          >
              <div
                aria-label="최신 뉴스 목록"
                className={`newsroll_all_latest_scroller${isLatestDragging ? " is_dragging" : ""}`}
                onPointerCancel={stopLatestDrag}
                onPointerDown={handleLatestPointerDown}
                onPointerLeave={stopLatestDrag}
                onPointerMove={handleLatestPointerMove}
                onPointerUp={stopLatestDrag}
                ref={latestScrollerRef}
                role="group"
              >
                {allNewsLatestItems.length > 0 ? (
                  allNewsLatestItems.map((item, index) => (
                    <AllNewsLatestCard
                      item={item}
                      key={`${item.title}-${index}`}
                      onClick={() => {
                        if (latestDidDragRef.current) {
                          return;
                        }

                        openAllNewsDetail(
                          createAllNewsArticle(item, item.category ?? homeArticle.category, index),
                        );
                      }}
                    />
                  ))
                ) : (
                  <DataUnavailableMessage target="전체 뉴스" />
                )}
              </div>
          </AllNewsSectionPanel>

          <AllNewsSectionPanel
            ariaLabel="언론사별 헤드라인"
            className="newsroll_all_press_panel"
            contentProps={{
              "aria-labelledby": `all-news-press-tab-${activePressIndex}`,
              id: "all-news-headline-panel",
              role: "tabpanel",
            }}
            title="언론사별 헤드라인"
          >
              <div className="newsroll_all_tabSticky newsroll_all_press_tabMenu">
                <div
                  className="newsroll_all_press_tabScroller"
                  role="tablist"
                  aria-label="언론사 선택"
                  onKeyDown={handlePressTabKeyDown}
                >
                  {visibleAllNewsPresses.map((press, index) => {
                    const selected = activePress === press;

                    return (
                      <Button
                        aria-controls="all-news-headline-panel"
                        aria-selected={selected}
                        className="tab tab_medium tab_filled tab_full_rounded newsroll_all_press_tabButton"
                        classNameOnly
                        id={`all-news-press-tab-${index}`}
                        key={press}
                        onClick={() => changeActivePress(press)}
                        role="tab"
                        tabIndex={selected ? 0 : -1}
                        type="button"
                      >
                        <div
                          className="newsroll_all_press_logo"
                          aria-hidden="true"
                        />
                        <span>{press}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
              <div className="wrapper_allTabPanelBody">
                <SeparatedList
                  dividerClassName="newsroll_all_itemDivider"
                  getKey={(item, index) => `${item.title}-${index}`}
                  items={headlineItems}
                  renderItem={(item, index) => (
                    <AllNewsHeadlineItem
                      item={item}
                      onClick={() =>
                        openAllNewsDetail(
                          createAllNewsArticle(item, activePress, index),
                        )
                      }
                    />
                  )}
                />
                {headlineItems.length === 0 ? (
                  <DataUnavailableMessage target="언론사별 헤드라인" />
                ) : canExpandHeadlines ? (
                  <MoreActionButton
                    ariaLabel={
                      showAllHeadlines
                        ? "언론사별 헤드라인 접기"
                        : "언론사별 헤드라인 더보기"
                    }
                    expanded={showAllHeadlines}
                    onClick={() => setShowAllHeadlines((current) => !current)}
                  />
                ) : null}
              </div>
          </AllNewsSectionPanel>

          <AllNewsSectionPanel
            ariaLabel="릴레이 뉴스"
            className="newsroll_all_relay_panel"
            contentProps={{
              "aria-labelledby": `all-news-relay-tab-${activeRelayIndex}`,
              id: `all-news-relay-panel-${activeRelayIndex}`,
              role: "tabpanel",
            }}
            title="릴레이 뉴스"
          >
              <div className="newsroll_all_tabSticky newsroll_all_category_tabSticky">
                <PillTabMenu
                  ariaLabel="릴레이 뉴스 카테고리"
                  className="newsroll_all_category_tabs"
                  getPanelId={(category) =>
                    category === activeRelayCategory
                      ? `all-news-relay-panel-${visibleAllNewsRelayCategories.indexOf(category)}`
                      : undefined
                  }
                  getTabId={(category) =>
                    `all-news-relay-tab-${visibleAllNewsRelayCategories.indexOf(category)}`
                  }
                  items={visibleAllNewsRelayCategories.map((category) => ({
                    id: category,
                    label: category,
                  }))}
                  onChange={changeActiveRelayCategory}
                  value={activeRelayCategory}
                />
              </div>
              <div className="wrapper_allTabPanelBody">
                <SeparatedList
                  dividerClassName="newsroll_all_itemDivider"
                  getKey={(item, index) => `${item.title}-${index}`}
                  items={relayItems}
                  renderItem={(item, index) => (
                    <AllNewsRelayItem
                      featured={index === 0 || index === 5}
                      item={item}
                      onClick={() =>
                        openAllNewsDetail(
                          createAllNewsArticle(item, activeRelayCategory, index),
                        )
                      }
                    />
                  )}
                />
                {relayItems.length === 0 ? (
                  <DataUnavailableMessage target="릴레이 뉴스" />
                ) : null}
              </div>
          </AllNewsSectionPanel>
        </section>
      )}
    </NewsRollCommonLayout>
  );
}
