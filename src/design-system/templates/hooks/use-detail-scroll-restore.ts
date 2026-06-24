"use client";

import { useCallback, useLayoutEffect, useRef, type RefObject } from "react";

type UseDetailScrollRestoreOptions = {
  isDetailOpen: boolean;
  nestedScrollSelector?: string;
  resetKey?: unknown;
  scrollerRef: RefObject<HTMLElement | null>;
};

export function useDetailScrollRestore({
  isDetailOpen,
  nestedScrollSelector,
  resetKey,
  scrollerRef,
}: UseDetailScrollRestoreOptions) {
  const resetKeyRef = useRef(resetKey);
  const wasDetailOpenRef = useRef(isDetailOpen);
  const shouldRestoreRef = useRef(false);
  const scrollTopRef = useRef(0);
  const nestedScrollTopsRef = useRef<number[]>([]);

  const captureScroll = useCallback(() => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    scrollTopRef.current = scroller.scrollTop;
    nestedScrollTopsRef.current = nestedScrollSelector
      ? Array.from(
          scroller.querySelectorAll<HTMLElement>(nestedScrollSelector),
          (nestedScroller) => nestedScroller.scrollTop,
        )
      : [];
  }, [nestedScrollSelector, scrollerRef]);

  const requestRestore = useCallback(() => {
    shouldRestoreRef.current = true;
  }, []);

  useLayoutEffect(() => {
    const wasDetailOpen = wasDetailOpenRef.current;
    const previousResetKey = resetKeyRef.current;
    wasDetailOpenRef.current = isDetailOpen;
    resetKeyRef.current = resetKey;

    if (isDetailOpen && (!wasDetailOpen || previousResetKey !== resetKey)) {
      const scroller = scrollerRef.current;

      if (scroller) {
        scroller.scrollTop = 0;

        if (nestedScrollSelector) {
          scroller
            .querySelectorAll<HTMLElement>(nestedScrollSelector)
            .forEach((nestedScroller) => {
              nestedScroller.scrollTop = 0;
            });
        }
      }
    }

    if (isDetailOpen || !shouldRestoreRef.current) {
      return;
    }

    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    scroller.scrollTop = scrollTopRef.current;

    if (nestedScrollSelector) {
      scroller
        .querySelectorAll<HTMLElement>(nestedScrollSelector)
        .forEach((nestedScroller, index) => {
          nestedScroller.scrollTop = nestedScrollTopsRef.current[index] ?? 0;
        });
    }

    shouldRestoreRef.current = false;
  }, [isDetailOpen, nestedScrollSelector, resetKey, scrollerRef]);

  return {
    captureScroll,
    requestRestore,
  };
}
