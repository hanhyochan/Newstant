import type { ReactNode, Ref } from "react";

type NewsRollPagePanelProps = {
  ariaLabel: string;
  children: ReactNode;
  contentRef?: Ref<HTMLDivElement>;
};

export function NewsRollPagePanel({
  ariaLabel,
  children,
  contentRef,
}: NewsRollPagePanelProps) {
  return (
    <section className="container_newsFeed newsroll_page_feed" aria-label={ariaLabel}>
      <article className="container_articleCard newsroll_page_panel">
        <div
          aria-label={ariaLabel}
          className="wrapper_articleCardContent newsroll_page_panelContent"
          ref={contentRef}
          role="region"
          tabIndex={0}
        >
          {children}
        </div>
      </article>
    </section>
  );
}
