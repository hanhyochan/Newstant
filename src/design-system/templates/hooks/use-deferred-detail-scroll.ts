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

function scrollTargetIntoScroller({
  bottomGap,
  scrollerSelector,
  targetId,
}: Required<Pick<UseDeferredDetailScrollOptions, "bottomGap" | "scrollerSelector">> & {
  targetId: string;
}) {
  const target = document.getElementById(targetId);
  const scroller = target?.closest(scrollerSelector);

  if (!(target instanceof HTMLElement) || !(scroller instanceof HTMLElement)) {
    return false;
  }

  const scrollerRect = scroller.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const targetScrollTop =
    scroller.scrollTop + targetRect.bottom - scrollerRect.bottom + bottomGap;
  const nextScrollTop = Math.min(
    Math.max(0, scroller.scrollHeight - scroller.clientHeight),
    Math.max(0, targetScrollTop),
  );
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  scroller.scrollTop = nextScrollTop;

  if (!prefersReducedMotion && typeof scroller.scrollTo === "function") {
    scroller.scrollTo({
      behavior: "smooth",
      top: nextScrollTop,
    });
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

    const timeout = window.setTimeout(() => {
      onBeforeScroll?.();

      window.requestAnimationFrame(() => {
        const didScroll = scrollTargetIntoScroller({
          bottomGap,
          scrollerSelector,
          targetId,
        });

        if (didScroll) {
          scrolledKeyRef.current = targetKey;
        }
      });
    }, delayMs);

    return () => window.clearTimeout(timeout);
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
