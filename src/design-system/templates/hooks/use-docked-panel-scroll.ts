"use client";

import { useEffect, useRef, type RefObject, type TouchEvent, type WheelEvent } from "react";

type BoundaryDirection = "end" | "start";
type RoutedScrollResult = false | "handled" | "locked";
type AdjacentPanels = {
  nextPanel: HTMLElement | null;
  previousPanel: HTMLElement | null;
};

const SCROLL_EDGE_THRESHOLD = 1;

type UseDockedPanelScrollOptions = {
  boundaryDelayMs: number;
  contentScrollerSelector?: string;
  dockedClassName: string;
  immediatePanelSelector?: string;
  navigationLockSelector?: string;
  panelSelector: string;
  rootRef: RefObject<HTMLElement | null>;
  scrollerRef: RefObject<HTMLElement | null>;
};

export function useDockedPanelScroll({
  boundaryDelayMs,
  contentScrollerSelector,
  dockedClassName,
  immediatePanelSelector,
  navigationLockSelector,
  panelSelector,
  rootRef,
  scrollerRef,
}: UseDockedPanelScrollOptions) {
  const scrollerTopRef = useRef(0);
  const touchYRef = useRef<number | null>(null);
  const panelBoundaryRef = useRef<{
    direction: BoundaryDirection | null;
    isReady: boolean;
    panel: HTMLElement | null;
    timeoutId: number | null;
  }>({
    direction: null,
    isReady: false,
    panel: null,
    timeoutId: null,
  });

  const clearBoundary = () => {
    if (panelBoundaryRef.current.timeoutId != null) {
      window.clearTimeout(panelBoundaryRef.current.timeoutId);
    }

    panelBoundaryRef.current = {
      direction: null,
      isReady: false,
      panel: null,
      timeoutId: null,
    };
  };

  const scheduleBoundary = (panel: HTMLElement, direction: BoundaryDirection) => {
    if (panelBoundaryRef.current.timeoutId != null) {
      window.clearTimeout(panelBoundaryRef.current.timeoutId);
    }

    const timeoutId = window.setTimeout(() => {
      const currentBoundary = panelBoundaryRef.current;

      if (currentBoundary.panel === panel && currentBoundary.direction === direction) {
        panelBoundaryRef.current = {
          direction,
          isReady: true,
          panel,
          timeoutId: null,
        };
      }
    }, boundaryDelayMs);

    panelBoundaryRef.current = {
      direction,
      isReady: false,
      panel,
      timeoutId,
    };
  };

  const waitForBoundary = (panel: HTMLElement, direction: BoundaryDirection) => {
    const boundaryState = panelBoundaryRef.current;
    const isReady = boundaryState.panel === panel
      && boundaryState.direction === direction
      && boundaryState.isReady;

    if (isReady) {
      clearBoundary();
      return true;
    }

    scheduleBoundary(panel, direction);
    return false;
  };

  const getAdjacentPanels = (panels: HTMLElement[], activePanel: HTMLElement): AdjacentPanels => {
    const activeIndex = panels.indexOf(activePanel);

    return {
      nextPanel: panels[activeIndex + 1] ?? null,
      previousPanel: activeIndex > 0 ? panels[activeIndex - 1] : null,
    };
  };

  const getPanels = () => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return [];
    }

    return Array.from(scroller.querySelectorAll<HTMLElement>(panelSelector));
  };

  const getActivePanel = () => {
    const scroller = scrollerRef.current;
    const panels = getPanels();

    if (!scroller || panels.length === 0) {
      return null;
    }

    return panels.reduce((closest, panel) => {
      const closestDistance = Math.abs(closest.offsetTop - scroller.scrollTop);
      const panelDistance = Math.abs(panel.offsetTop - scroller.scrollTop);
      return panelDistance < closestDistance ? panel : closest;
    }, panels[0]);
  };

  const getPanelContentScroller = (panel: HTMLElement) => {
    if (!contentScrollerSelector) {
      return panel;
    }

    return panel.querySelector<HTMLElement>(contentScrollerSelector);
  };

  const isImmediatePanel = (panel: HTMLElement) => (
    immediatePanelSelector ? panel.matches(immediatePanelSelector) : false
  );

  const isPanelNavigationLocked = (panel: HTMLElement) => (
    navigationLockSelector ? panel.querySelector(navigationLockSelector) != null : false
  );

  const isAtStart = (contentScroller: HTMLElement) => (
    contentScroller.scrollTop <= SCROLL_EDGE_THRESHOLD
  );

  const isAtEnd = (contentScroller: HTMLElement, maxScroll: number) => (
    contentScroller.scrollTop >= maxScroll - SCROLL_EDGE_THRESHOLD
  );

  const getScrollLimit = (contentScroller: HTMLElement) => (
    Math.max(0, contentScroller.scrollHeight - contentScroller.clientHeight)
  );

  const setPanelContentPosition = (panel: HTMLElement, position: BoundaryDirection) => {
    const contentScroller = getPanelContentScroller(panel);

    if (!contentScroller) {
      return;
    }

    contentScroller.scrollTop = !isImmediatePanel(panel) && position === "end"
      ? getScrollLimit(contentScroller)
      : 0;
  };

  const scrollToPanel = (
    panel: HTMLElement,
    contentPosition: BoundaryDirection = "start",
  ) => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    setPanelContentPosition(panel, contentPosition);

    if (typeof scroller.scrollTo === "function") {
      scroller.scrollTo({
        behavior: "smooth",
        top: panel.offsetTop,
      });
      return;
    }

    scroller.scrollTop = panel.offsetTop;
  };

  const moveToAdjacentPanel = (
    activePanel: HTMLElement,
    nextPanel: HTMLElement | null,
    direction: BoundaryDirection,
    contentPosition: BoundaryDirection,
  ) => {
    if (!nextPanel) {
      clearBoundary();
      return false;
    }

    if (!isImmediatePanel(activePanel) && !waitForBoundary(activePanel, direction)) {
      return true;
    }

    clearBoundary();
    scrollToPanel(nextPanel, contentPosition);
    return true;
  };

  const movePanelByDirection = (
    deltaY: number,
    activePanel: HTMLElement,
    previousPanel: HTMLElement | null,
    nextPanel: HTMLElement | null,
  ) => {
    if (deltaY < 0) {
      return moveToAdjacentPanel(activePanel, previousPanel, "start", "end");
    }

    if (deltaY > 0) {
      return moveToAdjacentPanel(activePanel, nextPanel, "end", "start");
    }

    clearBoundary();
    return false;
  };

  const scrollPanelContent = (
    activePanel: HTMLElement,
    contentScroller: HTMLElement,
    deltaY: number,
    maxScroll: number,
    direction: BoundaryDirection,
  ) => {
    const nextScrollTop = direction === "start"
      ? Math.max(0, contentScroller.scrollTop + deltaY)
      : Math.min(maxScroll, contentScroller.scrollTop + deltaY);

    contentScroller.scrollTop = nextScrollTop;

    const reachedBoundary = direction === "start"
      ? nextScrollTop <= SCROLL_EDGE_THRESHOLD
      : nextScrollTop >= maxScroll - SCROLL_EDGE_THRESHOLD;

    if (reachedBoundary) {
      scheduleBoundary(activePanel, direction);
    } else {
      clearBoundary();
    }

    return true;
  };

  const routeDockedPanelScroll = (deltaY: number): RoutedScrollResult => {
    const scroller = scrollerRef.current;
    const isDocked = rootRef.current?.classList.contains(dockedClassName) ?? false;

    if (!scroller || !isDocked) {
      return false;
    }

    const panels = getPanels();
    const activePanel = getActivePanel();

    if (!activePanel || panels.length === 0) {
      const maxScroll = getScrollLimit(scroller);
      const nextScrollTop = Math.max(0, Math.min(maxScroll, scroller.scrollTop + deltaY));

      if (nextScrollTop === scroller.scrollTop) {
        clearBoundary();
        return false;
      }

      scroller.scrollTop = nextScrollTop;
      clearBoundary();
      return "handled";
    }

    const { nextPanel, previousPanel } = getAdjacentPanels(panels, activePanel);
    const activeContentScroller = getPanelContentScroller(activePanel);

    if (!activeContentScroller) {
      return false;
    }

    if (isPanelNavigationLocked(activePanel)) {
      clearBoundary();
      return "locked";
    }

    const shouldScrollContent = !isImmediatePanel(activePanel);
    const maxScroll = getScrollLimit(activeContentScroller);

    if (!shouldScrollContent || maxScroll <= SCROLL_EDGE_THRESHOLD) {
      return movePanelByDirection(deltaY, activePanel, previousPanel, nextPanel)
        ? "handled"
        : false;
    }

    if (deltaY < 0) {
      if (!isAtStart(activeContentScroller)) {
        return scrollPanelContent(activePanel, activeContentScroller, deltaY, maxScroll, "start")
          ? "handled"
          : false;
      }

      return moveToAdjacentPanel(activePanel, previousPanel, "start", "end")
        ? "handled"
        : false;
    }

    if (deltaY > 0) {
      if (!isAtEnd(activeContentScroller, maxScroll)) {
        return scrollPanelContent(activePanel, activeContentScroller, deltaY, maxScroll, "end")
          ? "handled"
          : false;
      }

      return moveToAdjacentPanel(activePanel, nextPanel, "end", "start")
        ? "handled"
        : false;
    }

    return false;
  };

  const handleWheel = (event: WheelEvent<HTMLElement>) => {
    const routeResult = routeDockedPanelScroll(event.deltaY);

    if (!routeResult) {
      return;
    }

    if (routeResult === "handled" && event.cancelable) {
      event.preventDefault();
    }
    event.stopPropagation();
  };

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    touchYRef.current = event.touches[0]?.clientY ?? null;
  };

  const handleTouchMove = (event: TouchEvent<HTMLElement>) => {
    const currentY = event.touches[0]?.clientY;
    const previousY = touchYRef.current;

    if (currentY == null || previousY == null) {
      touchYRef.current = currentY ?? null;
      return;
    }

    const deltaY = previousY - currentY;

    const routeResult = routeDockedPanelScroll(deltaY);

    if (routeResult) {
      event.stopPropagation();
    }

    touchYRef.current = currentY;
  };

  const resetScroll = (scroller: HTMLElement) => {
    scroller.scrollTop = 0;
    scroller.querySelectorAll<HTMLElement>(panelSelector).forEach((panel) => {
      const contentScroller = getPanelContentScroller(panel);
      if (contentScroller) {
        contentScroller.scrollTop = 0;
      }
    });
    scrollerTopRef.current = 0;
    clearBoundary();
  };

  const restoreScrollTop = (scroller: HTMLElement) => {
    scroller.scrollTop = scrollerTopRef.current;
  };

  const storeScrollTop = () => {
    if (scrollerRef.current) {
      scrollerTopRef.current = scrollerRef.current.scrollTop;
    }
  };

  useEffect(() => () => {
    if (panelBoundaryRef.current.timeoutId != null) {
      window.clearTimeout(panelBoundaryRef.current.timeoutId);
    }
  }, []);

  return {
    handleTouchMove,
    handleTouchStart,
    handleWheel,
    resetScroll,
    restoreScrollTop,
    storeScrollTop,
  };
}
