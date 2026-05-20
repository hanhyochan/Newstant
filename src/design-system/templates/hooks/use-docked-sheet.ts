"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type TouchEvent,
  type WheelEvent,
} from "react";

type UseDockedSheetOptions = {
  children: ReactNode;
  dockedControlsSelector?: string;
  dockedGap: number;
  initialGap: number;
  minInitialTop?: number;
  movingSheet: boolean;
  onTouchMoveCapture?: (event: TouchEvent<HTMLElement>) => void;
  onTouchStartCapture?: (event: TouchEvent<HTMLElement>) => void;
  onWheelCapture?: (event: WheelEvent<HTMLElement>) => void;
  sheetScrollSelector?: string;
  top: ReactNode;
};

export function useDockedSheet({
  children,
  dockedControlsSelector,
  dockedGap,
  initialGap,
  minInitialTop,
  movingSheet,
  onTouchMoveCapture,
  onTouchStartCapture,
  onWheelCapture,
  sheetScrollSelector,
  top,
}: UseDockedSheetOptions) {
  const rootRef = useRef<HTMLElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  const touchYRef = useRef<number | null>(null);
  const sheetTopRef = useRef(0);
  const sheetBoundsRef = useRef({ initialTop: 0, stopTop: 0 });
  const [isSheetDocked, setIsSheetDocked] = useState(false);

  const getSheetScroller = () => {
    const sheet = sheetRef.current;

    if (!sheet) {
      return null;
    }

    if (!sheetScrollSelector) {
      return sheet;
    }

    return sheet.querySelector<HTMLElement>(sheetScrollSelector) ?? sheet;
  };

  const setSheetTop = (nextTop: number) => {
    const screen = rootRef.current;
    const { initialTop, stopTop } = sheetBoundsRef.current;
    const boundedTop = Math.min(initialTop, Math.max(stopTop, nextTop));

    sheetTopRef.current = boundedTop;
    screen?.style.setProperty("--newsroll-common-sheet-top", `${boundedTop}px`);
    setIsSheetDocked((current) => {
      const nextDocked = boundedTop <= stopTop + 1;
      return current === nextDocked ? current : nextDocked;
    });
  };

  const measureSheet = () => {
    const screen = rootRef.current;
    const topNode = topRef.current;

    if (!movingSheet || !screen || !topNode) {
      return;
    }

    const screenTop = screen.getBoundingClientRect().top;
    const toolbar = topNode.querySelector(".newsroll_toolbar");
    const dockedControls = dockedControlsSelector
      ? topNode.querySelector(dockedControlsSelector)
      : null;
    const toolbarRect = toolbar?.getBoundingClientRect();
    const toolbarTop = toolbarRect ? toolbarRect.top - screenTop : 0;
    const toolbarBottom = toolbarRect ? toolbarRect.bottom - screenTop : toolbarTop + 40;
    const dockedControlsHeight = dockedControls?.getBoundingClientRect().height ?? 0;
    const measuredStopTop = Math.round(toolbarBottom + dockedGap + dockedControlsHeight + dockedGap);
    const measuredTopBottom = Math.round(topNode.getBoundingClientRect().bottom - screenTop);
    const measuredInitialTop = Math.max(
      minInitialTop ?? 0,
      measuredStopTop,
      measuredTopBottom + initialGap,
    );
    const previousBounds = sheetBoundsRef.current;
    const previousTop = sheetTopRef.current || previousBounds.initialTop || measuredInitialTop;
    const wasDocked = previousTop <= previousBounds.stopTop + 1;
    const wasPartiallyLifted = previousTop < previousBounds.initialTop;
    const nextTop = wasDocked
      ? measuredStopTop
      : wasPartiallyLifted
        ? Math.min(measuredInitialTop, Math.max(measuredStopTop, previousTop))
        : measuredInitialTop;

    sheetBoundsRef.current = { initialTop: measuredInitialTop, stopTop: measuredStopTop };
    screen.style.setProperty("--newsroll-common-sheet-initial-top", `${measuredInitialTop}px`);
    setSheetTop(nextTop);
  };

  const isSheetContentAtStart = () => {
    const scroller = getSheetScroller();
    return !scroller || scroller.scrollTop <= 1;
  };

  const moveSheet = (deltaY: number) => {
    const scroller = getSheetScroller();
    const { initialTop, stopTop } = sheetBoundsRef.current;
    const currentTop = sheetTopRef.current || initialTop;

    if (!movingSheet || initialTop <= stopTop) {
      return false;
    }

    if (deltaY > 0 && currentTop > stopTop) {
      if (scroller) {
        scroller.scrollTop = 0;
      }

      setSheetTop(currentTop - deltaY);
      return true;
    }

    if (deltaY < 0 && currentTop < initialTop && isSheetContentAtStart()) {
      if (scroller) {
        scroller.scrollTop = 0;
      }

      setSheetTop(currentTop - deltaY);
      return true;
    }

    return false;
  };

  const handleWheel = (event: WheelEvent<HTMLElement>) => {
    onWheelCapture?.(event);

    if (event.defaultPrevented || !moveSheet(event.deltaY)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  };

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    onTouchStartCapture?.(event);
    touchYRef.current = event.touches[0]?.clientY ?? null;
  };

  const handleTouchMove = (event: TouchEvent<HTMLElement>) => {
    onTouchMoveCapture?.(event);

    if (event.defaultPrevented) {
      return;
    }

    const currentY = event.touches[0]?.clientY;
    const previousY = touchYRef.current;

    if (currentY == null || previousY == null) {
      touchYRef.current = currentY ?? null;
      return;
    }

    const deltaY = previousY - currentY;

    if (moveSheet(deltaY)) {
      event.preventDefault();
      event.stopPropagation();
    }

    touchYRef.current = currentY;
  };

  useLayoutEffect(() => {
    if (!movingSheet) {
      return undefined;
    }

    measureSheet();
    const frame = window.requestAnimationFrame(measureSheet);
    window.addEventListener("resize", measureSheet);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", measureSheet);
    };
  }, [children, dockedControlsSelector, dockedGap, initialGap, minInitialTop, movingSheet, top]);

  return {
    handleTouchMove,
    handleTouchStart,
    handleWheel,
    isSheetDocked,
    rootRef,
    sheetRef,
    topRef,
  };
}
