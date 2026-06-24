"use client";

import type { ReactNode } from "react";

import { IconButton } from "../components/button/icon-button";

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
        <IconButton
          className="newsroll_toolbar_icon newsroll_search_close"
          icon="close"
          label={closeLabel}
          onClick={onClose}
        />
      </div>
      <div className={contentClassName}>{children}</div>
    </section>
  );
}
