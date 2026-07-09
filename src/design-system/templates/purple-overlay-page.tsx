"use client";

import type { ReactNode } from "react";

import { IconButton } from "../components/button/icon-button";

type PurpleOverlayPageProps = {
  ariaLabel: string;
  children: ReactNode;
  closeLabel: string;
  contentClassName?: string;
  onClose: () => void;
};

export function PurpleOverlayPage({
  ariaLabel,
  children,
  closeLabel,
  contentClassName = "wrapper_searchContent",
  onClose,
}: PurpleOverlayPageProps) {
  return (
    <section className="search_page" aria-label={ariaLabel}>
      <div className="toolbar search_top" aria-label="상단 도구">
        <IconButton
          className="toolbar_icon search_close"
          icon="close"
          label={closeLabel}
          onClick={onClose}
        />
      </div>
      <div className={contentClassName}>{children}</div>
    </section>
  );
}
