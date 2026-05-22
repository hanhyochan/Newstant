import type { ReactNode } from "react";

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
  hero: NewsRollSummaryHeroProps;
  toolbar: ReactNode;
  toolbarClassName?: string;
};

function mergeClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

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
  hero,
  toolbar,
  toolbarClassName,
}: NewsRollSummaryHeroTopProps) {
  return (
    <>
      <header className={mergeClassNames("container_homeToolbar", toolbarClassName)}>
        {toolbar}
      </header>
      <NewsRollSummaryHero {...hero} />
    </>
  );
}
