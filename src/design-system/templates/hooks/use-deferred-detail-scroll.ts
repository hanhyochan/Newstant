"use client";

import { useEffect, useRef } from "react";

type UseDeferredDetailScrollOptions = {
  bottomGap?: number;
  delayMs?: number;
  enabled?: boolean;
  onBeforeScroll?: () => void;
  resetKey?: string | number | null;
  scrollerSelector?: string;
  targetId?: string | null;
  watch?: readonly unknown[];
};

function getScrollableAncestor(target: HTMLElement) {
  let current: HTMLElement | null = target.parentElement;

  while (current) {
    const overflowY = window.getComputedStyle(current).overflowY;
    const canScroll =
      current.scrollHeight > current.clientHeight &&
      (overflowY === "auto" || overflowY === "scroll");

    if (canScroll) {
      return current;
    }

    current = current.parentElement;
  }

  return null;
}

function scrollTargetIntoScroller({
  bottomGap,
  scrollerSelector,
  targetId,
}: Required<Pick<UseDeferredDetailScrollOptions, "bottomGap" | "scrollerSelector">> & {
  targetId: string;
}) {
  const target = document.getElementById(targetId);

  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const selectorScroller = target.closest(scrollerSelector);
  const scroller =
    selectorScroller instanceof HTMLElement && selectorScroller.scrollHeight > selectorScroller.clientHeight
      ? selectorScroller
      : getScrollableAncestor(target);

  if (!(scroller instanceof HTMLElement)) {
    return false;
  }

  const scrollerRect = scroller.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const targetScrollTop =
    scroller.scrollTop +
    targetRect.top -
    scrollerRect.top -
    (scroller.clientHeight - targetRect.height) / 2 +
    bottomGap / 2;
  const nextScrollTop = Math.min(
    Math.max(0, scroller.scrollHeight - scroller.clientHeight),
    Math.max(0, targetScrollTop),
  );
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (!prefersReducedMotion && typeof scroller.scrollTo === "function") {
    scroller.scrollTo({
      behavior: "smooth",
      top: nextScrollTop,
    });
  } else {
    scroller.scrollTop = nextScrollTop;
  }

  return true;
}

export function useDeferredDetailScroll({
  bottomGap = 24,
  delayMs = 0,
  enabled = true,
  onBeforeScroll,
  resetKey,
  scrollerSelector = ".wrapper_articleCardContent",
  targetId,
  watch = [],
}: UseDeferredDetailScrollOptions) {
  const scrolledKeyRef = useRef<string | null>(null);
  const targetKey = targetId ? `${resetKey ?? ""}:${targetId}` : null;

  useEffect(() => {
    scrolledKeyRef.current = null;
  }, [resetKey]);

  useEffect(() => {
    if (!enabled || !targetId || !targetKey) {
      return;
    }

    if (scrolledKeyRef.current === targetKey) {
      return;
    }

    let retryTimeout = 0;
    let isCancelled = false;
    const tryScroll = (attempt = 0) => {
      if (isCancelled) {
        return;
      }

      onBeforeScroll?.();

      window.requestAnimationFrame(() => {
        const didScroll = scrollTargetIntoScroller({
          bottomGap,
          scrollerSelector,
          targetId,
        });

        if (didScroll) {
          scrolledKeyRef.current = targetKey;
          return;
        }

        if (attempt >= 12) {
          return;
        }

        retryTimeout = window.setTimeout(() => {
          tryScroll(attempt + 1);
        }, 80);
      });
    };

    const timeout = window.setTimeout(() => {
      tryScroll();
    }, delayMs);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeout);
      window.clearTimeout(retryTimeout);
    };
  }, [
    bottomGap,
    delayMs,
    enabled,
    onBeforeScroll,
    scrollerSelector,
    targetId,
    targetKey,
    ...watch,
  ]);
}
