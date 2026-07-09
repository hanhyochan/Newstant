import type { HTMLAttributes, ReactNode } from "react";

type AllNewsPanelContentProps = HTMLAttributes<HTMLDivElement>;

function AllNewsPanelContent({
  children,
  className,
  ...props
}: AllNewsPanelContentProps) {
  const classNames = ["all_panelContent", "wrapper_panelContent", "u_minH0", "u_gap24", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames} {...props}>
      {children}
    </div>
  );
}

type AllNewsSectionPanelProps = {
  ariaLabel: string;
  children: ReactNode;
  className: string;
  contentProps?: AllNewsPanelContentProps;
  headingLevel?: "h1" | "h2";
  title: ReactNode;
};

export function AllNewsSectionPanel({
  ariaLabel,
  children,
  className,
  contentProps,
  headingLevel = "h2",
  title,
}: AllNewsSectionPanelProps) {
  const Heading = headingLevel;

  return (
    <article
      className={`container_articleCard wrapper_panelSurface_style all_panel ${className}`}
      aria-label={ariaLabel}
    >
      <AllNewsPanelContent {...contentProps}>
        <Heading className="text_sectionTitle">{title}</Heading>
        {children}
      </AllNewsPanelContent>
    </article>
  );
}
