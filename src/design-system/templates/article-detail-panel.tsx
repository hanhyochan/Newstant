import type { ReactNode } from "react";

import { IconButton } from "../components/button/icon-button";

type ArticleDetailPanelProps = {
  ariaLabel: string;
  backLabel?: string;
  children: ReactNode;
  className?: string;
  labelledBy: string;
  onBack?: () => void;
};

export function ArticleDetailPanel({
  ariaLabel,
  backLabel,
  children,
  className,
  labelledBy,
  onBack,
}: ArticleDetailPanelProps) {
  const articleClassName = `container_articleCard${className ? ` ${className}` : ""}`;

  return (
    <section className="container_newsFeed container_newsFeed_detail" aria-label={ariaLabel}>
      <article aria-labelledby={labelledBy} className={articleClassName}>
        {backLabel && onBack ? (
          <IconButton
            className="btn_detailBack"
            icon="chevron"
            label={backLabel}
            onClick={onBack}
            tone="translucent"
            variant="shaped"
          />
        ) : null}
        {children}
      </article>
    </section>
  );
}
