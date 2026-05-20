"use client";

import { useEffect, useRef, type RefObject, type TouchEvent, type WheelEvent } from "react";

type BoundaryDirection = "end" | "start";
type ShortPanelTransition = "delayed" | "instant";

type UseDockedPanelScrollOptions = {
  boundaryDelayMs: number;
  contentScrollerSelector?: string;
  dockedClassName: string;
  panelSelector: string;
  rootRef: RefObject<HTMLElement | null>;
  scrollerRef: RefObject<HTMLElement | null>;
  shortPanelTransition?: ShortPanelTransition;
};

export function useDockedPanelScroll({
  boundaryDelayMs,
  contentScrollerSelector,
  dockedClassName,
  panelSelector,
  rootRef,
  scrollerRef,
  shortPanelTransition = "delayed",
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

  const getScrollLimit = (contentScroller: HTMLElement) => (
    Math.max(0, contentScroller.scrollHeight - contentScroller.clientHeight)
  );

  const setPanelContentPosition = (panel: HTMLElement, position: BoundaryDirection) => {
    const contentScroller = getPanelContentScroller(panel);

    if (!contentScroller) {
      return;
    }

    contentScroller.scrollTop = position === "end"
      ? getScrollLimit(contentScroller)
      : 0;
  };

  const scrollToPanel = (panel: HTMLElement, contentPosition: BoundaryDirection = "start") => {
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

    if (shortPanelTransition === "delayed" && !waitForBoundary(activePanel, direction)) {
      return true;
    }

    clearBoundary();
    scrollToPanel(nextPanel, contentPosition);
    return true;
  };

  const routeDockedPanelScroll = (deltaY: number) => {
    const scroller = scrollerRef.current;
    const isDocked = rootRef.current?.classList.contains(dockedClassName) ?? false;
    const activePanel = getActivePanel();
    const panels = getPanels();

    if (!scroller || !isDocked || !activePanel || panels.length === 0) {
      return false;
    }

    const activeIndex = panels.indexOf(activePanel);
    const previousPanel = activeIndex > 0 ? panels[activeIndex - 1] : null;
    const nextPanel = activeIndex >= 0 ? panels[activeIndex + 1] : null;
    const activeContentScroller = getPanelContentScroller(activePanel);

    if (!activeContentScroller) {
      return false;
    }

    const maxScroll = getScrollLimit(activeContentScroller);
    const isPanelAtStart = activeContentScroller.scrollTop <= 1;
    const isPanelAtEnd = activeContentScroller.scrollTop >= maxScroll - 1;

    if (maxScroll <= 1) {
      if (deltaY < 0) {
        return moveToAdjacentPanel(activePanel, previousPanel, "start", "end");
      }

      if (deltaY > 0) {
        return moveToAdjacentPanel(activePanel, nextPanel, "end", "start");
      }

      clearBoundary();
      return false;
    }

    if (deltaY < 0) {
      if (!isPanelAtStart) {
        const nextScrollTop = Math.max(0, activeContentScroller.scrollTop + deltaY);
        activeContentScroller.scrollTop = nextScrollTop;
        if (nextScrollTop <= 1) {
          scheduleBoundary(activePanel, "start");
        } else {
          clearBoundary();
        }
        return true;
      }

      return moveToAdjacentPanel(activePanel, previousPanel, "start", "end");
    }

    if (deltaY > 0) {
      if (!isPanelAtEnd) {
        const nextScrollTop = Math.min(maxScroll, activeContentScroller.scrollTop + deltaY);
        activeContentScroller.scrollTop = nextScrollTop;
        if (nextScrollTop >= maxScroll - 1) {
          scheduleBoundary(activePanel, "end");
        } else {
          clearBoundary();
        }
        return true;
      }

      return moveToAdjacentPanel(activePanel, nextPanel, "end", "start");
    }

    return false;
  };

  const handleWheel = (event: WheelEvent<HTMLElement>) => {
    if (!routeDockedPanelScroll(event.deltaY)) {
      return;
    }

    event.preventDefault();
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

    if (routeDockedPanelScroll(deltaY)) {
      event.preventDefault();
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
