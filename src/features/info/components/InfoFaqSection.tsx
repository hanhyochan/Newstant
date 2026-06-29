import { useState } from "react";

import { type Faq } from "@/app/_newsroll/api";
import { ContentAccordion, Skeleton } from "@/design-system/components";
import { SeparatedList } from "@/features/shared/SeparatedList";

const faqSkeletonItems = Array.from({ length: 5 }, (_, index) => index);

export function InfoFaqSection({ items }: { items: Faq[] }) {
  const [openFaqIndexes, setOpenFaqIndexes] = useState<Set<number>>(
    () => new Set(),
  );
  const formatQuestion = (question: string) =>
    question.replace(/^(Q\.\s*)+/i, "");

  return (
    <section className="container_infoList wrapper_scrollList" aria-label="FAQ">
      {items.length === 0 ? (
        <SeparatedList
          dividerClassName="divider_infoSection"
          getKey={(item) => `faq-skeleton-${item}`}
          items={faqSkeletonItems}
          renderItem={() => (
            <div
              aria-hidden="true"
              className="container_contentAccordion"
              data-state="closed"
            >
              <div className="btn_contentAccordionTrigger">
                <span className="text_contentAccordionTitle">
                  <Skeleton shape="title" width="lg" />
                </span>
                <span className="icon_contentAccordionChevron" aria-hidden="true" />
              </div>
            </div>
          )}
        />
      ) : (
        <SeparatedList
          dividerClassName="divider_infoSection"
          getKey={(item, index) => `${item.question}-${index}`}
          items={items}
          renderItem={(item, index) => {
            const isOpen = openFaqIndexes.has(index);

            return (
              <ContentAccordion
                contentId={`info-faq-answer-${index}`}
                isOpen={isOpen}
                onToggle={() => {
                  setOpenFaqIndexes((current) => {
                    const next = new Set(current);

                    if (next.has(index)) {
                      next.delete(index);
                    } else {
                      next.add(index);
                    }

                    return next;
                  });
                }}
                title={`Q. ${formatQuestion(item.question)}`}
                triggerId={`info-faq-summary-${index}`}
              >
                <p className="text_infoBody text_contentAccordionBody">
                  {item.answer}
                </p>
              </ContentAccordion>
            );
          }}
        />
      )}
    </section>
  );
}
