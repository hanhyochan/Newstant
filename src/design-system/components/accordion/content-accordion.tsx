import type { ReactNode } from "react";

import { cn } from "../shared/utils";

export type ContentAccordionProps = {
  children: ReactNode;
  className?: string;
  contentId: string;
  isOpen: boolean;
  onToggle: () => void;
  title: ReactNode;
  triggerId: string;
};

export function ContentAccordion({
  children,
  className,
  contentId,
  isOpen,
  onToggle,
  title,
  triggerId,
}: ContentAccordionProps) {
  return (
    <div
      className={cn("container_contentAccordion", className)}
      data-state={isOpen ? "open" : "closed"}
    >
      <button
        aria-controls={contentId}
        aria-expanded={isOpen}
        className="btn_contentAccordionTrigger"
        id={triggerId}
        onClick={onToggle}
        type="button"
      >
        <span className="text_contentAccordionTitle">{title}</span>
        <span className="icon_contentAccordionChevron" aria-hidden="true" />
      </button>
      <div
        aria-hidden={!isOpen}
        aria-labelledby={triggerId}
        className="wrapper_contentAccordionBodyMotion"
        id={contentId}
        role="region"
      >
        <div className="wrapper_contentAccordionBodyInner">
          {children}
        </div>
      </div>
    </div>
  );
}
