import type { ReactNode } from "react";

import { NewsRollTopFrame } from "./top-frame";

type NewsRollSummaryHeroProps = {
  ariaLabel: string;
  caption: string;
  className?: string;
  controls?: ReactNode;
  count: string;
  greeting: ReactNode;
  unit: string;
};

type NewsRollSummaryHeroTopProps = {
  controls?: ReactNode;
  footer?: ReactNode;
  hero: NewsRollSummaryHeroProps;
  toolbar: ReactNode;
  toolbarClassName?: string;
};

export function NewsRollSummaryHero({
  ariaLabel,
  caption,
  className,
  controls,
  count,
  greeting,
  unit,
}: NewsRollSummaryHeroProps) {
  return (
    <section className={`container_hero${className ? ` ${className}` : ""}`} aria-label={ariaLabel}>
      <p className="text_greeting">{greeting}</p>
      <p className="wrapper_hero">
        <strong>
          {count}
          <span className="text_heroUnit">{unit}</span>
        </strong>
        <span className="text_heroCaption">{caption}</span>
      </p>
      {controls}
    </section>
  );
}

export function NewsRollSummaryHeroTop({
  controls,
  footer,
  hero,
  toolbar,
  toolbarClassName,
}: NewsRollSummaryHeroTopProps) {
  return (
    <NewsRollTopFrame
      footer={footer}
      headerClassName={toolbarClassName}
      headerControls={controls}
      hero={<NewsRollSummaryHero {...hero} />}
      toolbar={toolbar}
    />
  );
}
