import { Fragment, type ReactNode } from "react";

export type SearchHighlightPart = {
  isMatch: boolean;
  text: string;
};

export function splitSearchHighlightText(
  text: string,
  query = "",
): SearchHighlightPart[] {
  const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");

  if (!normalizedQuery) {
    return [{ isMatch: false, text }];
  }

  const normalizedText = text.toLocaleLowerCase("ko-KR");
  const parts: SearchHighlightPart[] = [];
  let cursor = 0;
  let index = normalizedText.indexOf(normalizedQuery);

  while (index !== -1) {
    if (index > cursor) {
      parts.push({ isMatch: false, text: text.slice(cursor, index) });
    }

    parts.push({
      isMatch: true,
      text: text.slice(index, index + normalizedQuery.length),
    });
    cursor = index + normalizedQuery.length;
    index = normalizedText.indexOf(normalizedQuery, cursor);
  }

  if (cursor < text.length) {
    parts.push({ isMatch: false, text: text.slice(cursor) });
  }

  return parts.filter((part) => part.text.length > 0);
}

export function getSearchHighlightTargetId(rootId: string, targetKey?: string) {
  return `${rootId}-search-${targetKey ?? "match"}`;
}

export function getSearchTextParagraphs(text = "") {
  const paragraphs = text
    .split(/\r?\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return paragraphs.length > 0 ? paragraphs : [text];
}

function getScrollableSearchAncestor(target: HTMLElement) {
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

function isSearchTargetVisible(
  target: HTMLElement,
  scroller: HTMLElement | null,
) {
  const targetRect = target.getBoundingClientRect();

  if (!scroller) {
    return targetRect.top >= 0 && targetRect.bottom <= window.innerHeight;
  }

  const scrollerRect = scroller.getBoundingClientRect();

  return (
    targetRect.top >= scrollerRect.top &&
    targetRect.bottom <= scrollerRect.bottom
  );
}

function scrollSearchTargetNow(targetId: string) {
  const target = document.getElementById(targetId);

  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const scroller = getScrollableSearchAncestor(target);

  if (isSearchTargetVisible(target, scroller)) {
    return true;
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (!scroller) {
    target.scrollIntoView({
      block: "center",
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
    return false;
  }

  const scrollerRect = scroller.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const nextScrollTop = Math.min(
    Math.max(0, scroller.scrollHeight - scroller.clientHeight),
    Math.max(
      0,
      scroller.scrollTop +
        targetRect.top -
        scrollerRect.top -
        (scroller.clientHeight - targetRect.height) / 2,
    ),
  );

  scroller.scrollTo({
    top: nextScrollTop,
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });

  return false;
}

export function scrollSearchHighlightTargetIntoView(targetId: string) {
  let attempt = 0;

  const tryScroll = () => {
    window.requestAnimationFrame(() => {
      const isVisible = scrollSearchTargetNow(targetId);

      if (isVisible || attempt >= 12) {
        return;
      }

      attempt += 1;
      window.setTimeout(tryScroll, 80);
    });
  };

  tryScroll();
}

export type SearchHighlightTextProps = {
  children: string;
  query?: string;
  targetId?: string;
};

export function SearchHighlightText({
  children,
  query = "",
  targetId,
}: SearchHighlightTextProps): ReactNode {
  if (!query.trim()) {
    return children;
  }

  let didSetTargetId = false;

  return (
    <>
      {splitSearchHighlightText(children, query).map((part, index) => {
        const nextTargetId =
          part.isMatch && targetId && !didSetTargetId ? targetId : undefined;

        if (nextTargetId) {
          didSetTargetId = true;
        }

        return part.isMatch ? (
          <mark
            className="mark_authAgreementSearch"
            id={nextTargetId}
            key={`${part.text}-${index}`}
          >
            {part.text}
          </mark>
        ) : (
          <Fragment key={`${part.text}-${index}`}>{part.text}</Fragment>
        );
      })}
    </>
  );
}
