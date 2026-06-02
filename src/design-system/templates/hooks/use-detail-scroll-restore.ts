"use client";

import { useCallback, useLayoutEffect, useRef, type RefObject } from "react";

type UseDetailScrollRestoreOptions = {
  isDetailOpen: boolean;
  nestedScrollSelector?: string;
  scrollerRef: RefObject<HTMLElement | null>;
};

export function useDetailScrollRestore({
  isDetailOpen,
  nestedScrollSelector,
  scrollerRef,
}: UseDetailScrollRestoreOptions) {
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
  }, [isDetailOpen, nestedScrollSelector, scrollerRef]);

  return {
    captureScroll,
    requestRestore,
  };
}
