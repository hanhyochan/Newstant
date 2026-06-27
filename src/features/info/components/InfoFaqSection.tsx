import { useState } from "react";

import { type Faq } from "@/app/_newsroll/api";
import { ContentAccordion } from "@/design-system/components";
import { DataUnavailableMessage } from "@/features/shared/DataUnavailableMessage";
import { SeparatedList } from "@/features/shared/SeparatedList";

export function InfoFaqSection({ items }: { items: Faq[] }) {
  const [openFaqIndexes, setOpenFaqIndexes] = useState<Set<number>>(
    () => new Set(),
  );
  const formatQuestion = (question: string) =>
    question.replace(/^(Q\.\s*)+/i, "");

  return (
    <section className="container_infoList wrapper_scrollList" aria-label="FAQ">
      {items.length === 0 ? (
        <DataUnavailableMessage target="FAQ" />
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
