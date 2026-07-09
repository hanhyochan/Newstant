import type { ReactNode, Ref } from "react";

type PagePanelProps = {
  ariaLabel: string;
  children: ReactNode;
  contentRef?: Ref<HTMLDivElement>;
};

export function PagePanel({
  ariaLabel,
  children,
  contentRef,
}: PagePanelProps) {
  return (
    <section className="container_newsFeed page_feed" aria-label={ariaLabel}>
      <article className="container_articleCard page_panel">
        <div
          aria-label={ariaLabel}
          className="wrapper_articleCardContent page_panelContent"
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
