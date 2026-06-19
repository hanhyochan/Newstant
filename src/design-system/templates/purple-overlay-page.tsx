"use client";

import type { ReactNode } from "react";

type NewsRollPurpleOverlayPageProps = {
  ariaLabel: string;
  children: ReactNode;
  closeLabel: string;
  contentClassName?: string;
  onClose: () => void;
};

export function NewsRollPurpleOverlayPage({
  ariaLabel,
  children,
  closeLabel,
  contentClassName = "wrapper_searchContent",
  onClose,
}: NewsRollPurpleOverlayPageProps) {
  return (
    <section className="newsroll_search_page" aria-label={ariaLabel}>
      <div className="newsroll_toolbar newsroll_search_top" aria-label="상단 도구">
        <button
          aria-label={closeLabel}
          className="newsroll_toolbar_icon newsroll_search_close"
          onClick={onClose}
          type="button"
        >
          <span aria-hidden="true" />
        </button>
      </div>
      <div className={contentClassName}>{children}</div>
    </section>
  );
}
