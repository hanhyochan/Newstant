"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type TouchEventHandler,
  type TouchEvent,
  type WheelEvent,
} from "react";

type UseDockedSheetOptions = {
  children: ReactNode;
  dockedControlsSelector?: string;
  dockedGap: number;
  fixedInitialTop?: number;
  initialGap: number;
  initiallyDocked?: boolean;
  lockSheetPosition?: boolean;
  minInitialTop?: number;
  movingSheet: boolean;
  onTouchCancelCapture?: TouchEventHandler<HTMLElement>;
  onTouchEndCapture?: TouchEventHandler<HTMLElement>;
  onTouchMoveCapture?: (event: TouchEvent<HTMLElement>) => void;
  onTouchStartCapture?: (event: TouchEvent<HTMLElement>) => void;
  onWheelCapture?: (event: WheelEvent<HTMLElement>) => void;
  sheetNestedScrollResetSelector?: string;
  sheetScrollSelector?: string;
  sheetUndockSignal?: number;
  top: ReactNode;
};

const DEFAULT_TOOLBAR_HEIGHT = 40;
const SHEET_EDGE_THRESHOLD = 1;
const WHEEL_HANDOFF_RELEASE_MS = 420;
type ScrollInput = "touch" | "wheel";

export function useDockedSheet({
  children,
  dockedControlsSelector,
  dockedGap,
  fixedInitialTop,
  initialGap,
  initiallyDocked = false,
  lockSheetPosition = false,
  minInitialTop,
  movingSheet,
  onTouchCancelCapture,
  onTouchEndCapture,
  onTouchMoveCapture,
  onTouchStartCapture,
  onWheelCapture,
  sheetNestedScrollResetSelector,
  sheetScrollSelector,
  sheetUndockSignal,
  top,
}: UseDockedSheetOptions) {
  const rootRef = useRef<HTMLElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  const touchYRef = useRef<number | null>(null);
  const sheetHandoffLockRef = useRef<{
    direction: number;
    timeoutId: number | null;
  } | null>(null);
  const sheetTopRef = useRef(0);
  const sheetBoundsRef = useRef({ initialTop: 0, stopTop: 0 });
  const hasMeasuredRef = useRef(false);
  const lastSheetUndockSignalRef = useRef(sheetUndockSignal);
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

  const clearSheetHandoffLock = () => {
    const lock = sheetHandoffLockRef.current;

    if (lock?.timeoutId != null) {
      window.clearTimeout(lock.timeoutId);
    }

    sheetHandoffLockRef.current = null;
    rootRef.current?.classList.remove("is_newsrollSheetHandoffLocked");
  };

  const setSheetHandoffLock = (direction: number, input: ScrollInput) => {
    clearSheetHandoffLock();

    const lock = {
      direction,
      timeoutId: null as number | null,
    };

    if (input === "wheel") {
      lock.timeoutId = window.setTimeout(clearSheetHandoffLock, WHEEL_HANDOFF_RELEASE_MS);
    }

    sheetHandoffLockRef.current = lock;
    rootRef.current?.classList.add("is_newsrollSheetHandoffLocked");
  };

  const consumeSheetHandoffLock = (deltaY: number, input: ScrollInput) => {
    const direction = Math.sign(deltaY);
    const lock = sheetHandoffLockRef.current;

    if (!lock || direction === 0) {
      return false;
    }

    if (lock.direction !== direction) {
      clearSheetHandoffLock();
      return false;
    }

    if (input === "wheel") {
      setSheetHandoffLock(direction, input);
    }

    return true;
  };

  const setSheetTop = (nextTop: number) => {
    const screen = rootRef.current;
    const { initialTop, stopTop } = sheetBoundsRef.current;
    const boundedTop = Math.min(initialTop, Math.max(stopTop, nextTop));

    sheetTopRef.current = boundedTop;
    screen?.style.setProperty("--newsroll-common-sheet-top", `${boundedTop}px`);
    setIsSheetDocked((current) => {
      const nextDocked = boundedTop <= stopTop + SHEET_EDGE_THRESHOLD;
      return current === nextDocked ? current : nextDocked;
    });
  };

  const getCurrentSheetTop = () => {
    const screen = rootRef.current;
    const sheet = sheetRef.current;

    if (!screen || !sheet) {
      return sheetTopRef.current || sheetBoundsRef.current.initialTop;
    }

    return Math.round(sheet.getBoundingClientRect().top - screen.getBoundingClientRect().top);
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
    const toolbarBottom = toolbarRect
      ? toolbarRect.bottom - screenTop
      : toolbarTop + DEFAULT_TOOLBAR_HEIGHT;
    const dockedControlsHeight = dockedControls
      ? Math.max(
          dockedControls.getBoundingClientRect().height,
          dockedControls.scrollHeight,
        )
      : 0;
    const measuredStopTop = Math.round(toolbarBottom + dockedGap + dockedControlsHeight + dockedGap);
    const measuredTopBottom = Math.round(topNode.getBoundingClientRect().bottom - screenTop);
    const previousBounds = sheetBoundsRef.current;
    const isFirstMeasure = !hasMeasuredRef.current;
    const measuredContentInitialTop = Math.max(measuredStopTop, measuredTopBottom + initialGap);
    const rawInitialTop =
      fixedInitialTop != null
        ? Math.max(measuredStopTop, fixedInitialTop)
        : Math.max(minInitialTop ?? 0, measuredContentInitialTop);
    const previousTopBeforeMeasure =
      sheetTopRef.current || previousBounds.initialTop || rawInitialTop;
    const shouldPreserveDockedInitialTop =
      !isFirstMeasure
      && previousBounds.initialTop > rawInitialTop
      && previousTopBeforeMeasure <= previousBounds.stopTop + SHEET_EDGE_THRESHOLD;
    const measuredInitialTop =
      shouldPreserveDockedInitialTop
        ? previousBounds.initialTop
        : rawInitialTop;
    const previousTop = previousTopBeforeMeasure || measuredInitialTop;
    const wasDocked = previousTop <= previousBounds.stopTop + 1;
    const wasPartiallyLifted = previousTop < previousBounds.initialTop;
    let nextTop = measuredInitialTop;

    if (lockSheetPosition) {
      nextTop = measuredStopTop;
    } else if (isFirstMeasure && initiallyDocked) {
      nextTop = measuredStopTop;
    } else if (wasDocked) {
      nextTop = measuredStopTop;
    } else if (wasPartiallyLifted) {
      nextTop = Math.min(measuredInitialTop, Math.max(measuredStopTop, previousTop));
    }

    sheetBoundsRef.current = { initialTop: measuredInitialTop, stopTop: measuredStopTop };
    screen.style.setProperty("--newsroll-common-sheet-initial-top", `${measuredInitialTop}px`);
    screen.style.setProperty("--newsroll-common-sheet-stop-top", `${measuredStopTop}px`);
    setSheetTop(nextTop);
    hasMeasuredRef.current = true;
  };

  const isSheetContentAtStart = () => {
    const scroller = getSheetScroller();
    return !scroller || scroller.scrollTop <= SHEET_EDGE_THRESHOLD;
  };

  const isSheetUndocked = () => {
    const { initialTop, stopTop } = sheetBoundsRef.current;
    const currentTop = getCurrentSheetTop() || initialTop;

    if (lockSheetPosition) {
      return false;
    }

    return movingSheet && currentTop > stopTop + SHEET_EDGE_THRESHOLD;
  };

  const resetSheetScroll = () => {
    const scroller = getSheetScroller();

    if (!scroller) {
      return;
    }

    scroller.scrollTop = 0;

    if (!sheetNestedScrollResetSelector) {
      return;
    }

    scroller.querySelectorAll<HTMLElement>(sheetNestedScrollResetSelector).forEach((node) => {
      node.scrollTop = 0;
    });
  };

  const moveSheet = (deltaY: number, input: ScrollInput) => {
    const { initialTop, stopTop } = sheetBoundsRef.current;
    const currentTop = getCurrentSheetTop() || initialTop;

    if (lockSheetPosition) {
      return false;
    }

    if (!movingSheet || initialTop <= stopTop) {
      return false;
    }

    if (deltaY > 0 && currentTop > stopTop) {
      const nextTop = currentTop - deltaY;
      resetSheetScroll();
      setSheetTop(nextTop);

      if (nextTop <= stopTop + SHEET_EDGE_THRESHOLD) {
        setSheetHandoffLock(1, input);
      }

      return true;
    }

    if (deltaY < 0 && currentTop < initialTop && isSheetContentAtStart()) {
      const nextTop = currentTop - deltaY;
      resetSheetScroll();
      setSheetTop(nextTop);

      if (nextTop >= initialTop - SHEET_EDGE_THRESHOLD) {
        setSheetHandoffLock(-1, input);
      }

      return true;
    }

    return false;
  };

  const handleWheel = (event: WheelEvent<HTMLElement>) => {
    if (consumeSheetHandoffLock(event.deltaY, "wheel")) {
      if (event.cancelable) {
        event.preventDefault();
      }
      event.stopPropagation();
      return;
    }

    onWheelCapture?.(event);

    if (event.defaultPrevented || event.isPropagationStopped() || !moveSheet(event.deltaY, "wheel")) {
      return;
    }

    if (event.cancelable) {
      event.preventDefault();
    }
    event.stopPropagation();
  };

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    onTouchStartCapture?.(event);
    if (isSheetUndocked()) {
      resetSheetScroll();
    }
    touchYRef.current = event.touches[0]?.clientY ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    onTouchEndCapture?.(event);
    touchYRef.current = null;
    clearSheetHandoffLock();
  };

  const handleTouchCancel = (event: TouchEvent<HTMLElement>) => {
    onTouchCancelCapture?.(event);
    touchYRef.current = null;
    clearSheetHandoffLock();
  };

  const handleTouchMove = (event: TouchEvent<HTMLElement>) => {
    const currentY = event.touches[0]?.clientY;
    const previousY = touchYRef.current;

    if (currentY == null || previousY == null) {
      touchYRef.current = currentY ?? null;
      return;
    }

    const deltaY = previousY - currentY;

    if (consumeSheetHandoffLock(deltaY, "touch")) {
      event.stopPropagation();
      touchYRef.current = currentY;
      return;
    }

    onTouchMoveCapture?.(event);

    if (event.defaultPrevented || event.isPropagationStopped()) {
      touchYRef.current = currentY;
      return;
    }

    if (moveSheet(deltaY, "touch")) {
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
  }, [
    children,
    dockedControlsSelector,
    dockedGap,
    fixedInitialTop,
    initialGap,
    initiallyDocked,
    lockSheetPosition,
    minInitialTop,
    movingSheet,
    sheetNestedScrollResetSelector,
    top,
  ]);

  useLayoutEffect(() => {
    if (
      !movingSheet
      || lockSheetPosition
      || sheetUndockSignal == null
      || lastSheetUndockSignalRef.current === sheetUndockSignal
    ) {
      return undefined;
    }

    lastSheetUndockSignalRef.current = sheetUndockSignal;
    const frame = window.requestAnimationFrame(() => {
      clearSheetHandoffLock();
      resetSheetScroll();
      setSheetTop(sheetBoundsRef.current.initialTop);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [lockSheetPosition, movingSheet, sheetUndockSignal]);

  return {
    handleTouchCancel,
    handleTouchEnd,
    handleTouchMove,
    handleTouchStart,
    handleWheel,
    isSheetDocked,
    rootRef,
    sheetRef,
    topRef,
  };
}
