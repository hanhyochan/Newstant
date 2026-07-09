import type { ReactNode } from "react";

import { TopFrame } from "./top-frame";

type SummaryHeroProps = {
  ariaLabel: string;
  caption: string;
  className?: string;
  controls?: ReactNode;
  count: string;
  greeting: ReactNode;
  unit: string;
};

type SummaryHeroTopProps = {
  controls?: ReactNode;
  footer?: ReactNode;
  hero: SummaryHeroProps;
  toolbar: ReactNode;
  toolbarClassName?: string;
};

export function SummaryHero({
  ariaLabel,
  caption,
  className,
  controls,
  count,
  greeting,
  unit,
}: SummaryHeroProps) {
  return (
    <section className={`container_hero${className ? ` ${className}` : ""}`} aria-label={ariaLabel}>
      <HeroTitle>{greeting}</HeroTitle>
      <HeroSummary caption={caption} count={count} unit={unit} />
      {controls}
    </section>
  );
}

export function HeroTitle({ children }: { children: ReactNode }) {
  return <p className="text_greeting">{children}</p>;
}

export function HeroSummary({
  caption,
  count,
  unit,
}: {
  caption: string;
  count: string;
  unit: string;
}) {
  return (
    <p className="wrapper_hero">
      <strong>
        {count}
        <span className="text_heroUnit">{unit}</span>
      </strong>
      <span className="text_heroCaption">{caption}</span>
    </p>
  );
}

export function SummaryHeroTop({
  controls,
  footer,
  hero,
  toolbar,
  toolbarClassName,
}: SummaryHeroTopProps) {
  return (
    <TopFrame
      footer={footer}
      headerClassName={toolbarClassName}
      headerControls={controls}
      hero={<SummaryHero {...hero} />}
      toolbar={toolbar}
    />
  );
}
