import type { ReactNode } from "react";

type NewsRollArticleDetailPanelProps = {
  ariaLabel: string;
  backLabel?: string;
  children: ReactNode;
  className?: string;
  labelledBy: string;
  onBack?: () => void;
};

export function NewsRollArticleDetailPanel({
  ariaLabel,
  backLabel,
  children,
  className,
  labelledBy,
  onBack,
}: NewsRollArticleDetailPanelProps) {
  const articleClassName = `container_articleCard${className ? ` ${className}` : ""}`;

  return (
    <section className="container_newsFeed container_newsFeed_detail" aria-label={ariaLabel}>
      <article aria-labelledby={labelledBy} className={articleClassName}>
        {backLabel && onBack ? (
          <button aria-label={backLabel} className="newsroll_all_detail_back" onClick={onBack} type="button">
            <span aria-hidden="true" />
          </button>
        ) : null}
        {children}
      </article>
    </section>
  );
}
