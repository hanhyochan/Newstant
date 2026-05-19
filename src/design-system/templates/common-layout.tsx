"use client";

import {
  forwardRef,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  type RefCallback,
  type TouchEvent,
  type WheelEvent,
} from "react";

type NewsRollCommonLayoutProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  dockedClassName?: string;
  dockedControlsSelector?: string;
  dockedGap?: number;
  initialGap?: number;
  minInitialTop?: number;
  movingSheet?: boolean;
  sheetClassName?: string;
  sheetRef?: Ref<HTMLDivElement>;
  sheetScrollSelector?: string;
  sheetProps?: HTMLAttributes<HTMLDivElement>;
  top: ReactNode;
  topClassName?: string;
  topRef?: Ref<HTMLDivElement>;
  topProps?: HTMLAttributes<HTMLDivElement>;
};

function mergeClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (!ref) {
    return;
  }

  if (typeof ref === "function") {
    ref(value);
    return;
  }

  (ref as { current: T | null }).current = value;
}

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): RefCallback<T> {
  return (value) => {
    refs.forEach((ref) => assignRef(ref, value));
  };
}

export const NewsRollCommonLayout = forwardRef<HTMLElement, NewsRollCommonLayoutProps>(function NewsRollCommonLayout({
  children,
  className,
  dockedClassName = "is_newsrollSheetDocked",
  dockedControlsSelector,
  dockedGap = 16,
  initialGap = 40,
  minInitialTop,
  movingSheet = false,
  sheetClassName,
  sheetProps,
  sheetRef,
  sheetScrollSelector,
  top,
  topClassName,
  topProps,
  topRef,
  ...rootProps
}, rootRef) {
  const localRootRef = useRef<HTMLElement | null>(null);
  const localSheetRef = useRef<HTMLDivElement | null>(null);
  const localTopRef = useRef<HTMLDivElement | null>(null);
  const touchYRef = useRef<number | null>(null);
  const sheetTopRef = useRef(0);
  const sheetBoundsRef = useRef({ initialTop: 0, stopTop: 0 });
  const [isSheetDocked, setIsSheetDocked] = useState(false);

  const getSheetScroller = () => {
    const sheet = localSheetRef.current;

    if (!sheet) {
      return null;
    }

    if (!sheetScrollSelector) {
      return sheet;
    }

    return sheet.querySelector<HTMLElement>(sheetScrollSelector) ?? sheet;
  };

  const setSheetTop = (nextTop: number) => {
    const screen = localRootRef.current;
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
    const screen = localRootRef.current;
    const topNode = localTopRef.current;

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
    rootProps.onWheelCapture?.(event);

    if (event.defaultPrevented || !moveSheet(event.deltaY)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  };

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    rootProps.onTouchStartCapture?.(event);
    touchYRef.current = event.touches[0]?.clientY ?? null;
  };

  const handleTouchMove = (event: TouchEvent<HTMLElement>) => {
    rootProps.onTouchMoveCapture?.(event);

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

  const {
    onTouchMoveCapture,
    onTouchStartCapture,
    onWheelCapture,
    ...sectionProps
  } = rootProps;

  return (
    <section
      {...sectionProps}
      className={mergeClassNames(
        "newsroll_common_layout",
        movingSheet ? "newsroll_common_layout_movingSheet" : undefined,
        movingSheet && isSheetDocked ? dockedClassName : undefined,
        className,
      )}
      onTouchMoveCapture={movingSheet ? handleTouchMove : onTouchMoveCapture}
      onTouchStartCapture={movingSheet ? handleTouchStart : onTouchStartCapture}
      onWheelCapture={movingSheet ? handleWheel : onWheelCapture}
      ref={mergeRefs(localRootRef, rootRef)}
    >
      <div
        {...topProps}
        className={mergeClassNames("newsroll_common_top", topClassName, topProps?.className)}
        ref={mergeRefs(localTopRef, topRef)}
      >
        {top}
      </div>
      <div
        {...sheetProps}
        className={mergeClassNames("newsroll_common_sheet", sheetClassName, sheetProps?.className)}
        ref={mergeRefs(localSheetRef, sheetRef)}
      >
        {children}
      </div>
    </section>
  );
});
