import type { MouseEventHandler, ReactNode } from "react";

export type SearchResultButtonProps = {
  meta: ReactNode;
  onClick: MouseEventHandler<HTMLButtonElement>;
  snippet?: ReactNode;
  title: ReactNode;
};

export function SearchResultButton({
  meta,
  onClick,
  snippet,
  title,
}: SearchResultButtonProps) {
  return (
    <button className="btn_searchResult" onClick={onClick} type="button">
      <strong>{title}</strong>
      <span>{meta}</span>
      {snippet ? (
        <p className="text_searchResultSnippet">{snippet}</p>
      ) : null}
    </button>
  );
}
