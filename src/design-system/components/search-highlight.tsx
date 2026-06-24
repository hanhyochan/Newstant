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

export function scrollSearchHighlightTargetIntoView(targetId: string) {
  window.requestAnimationFrame(() => {
    document
      .getElementById(targetId)
      ?.scrollIntoView({ block: "center", behavior: "smooth" });
  });
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
