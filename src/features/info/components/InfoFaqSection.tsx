import { useState } from "react";

import { type Faq } from "@/app/_newsroll/api";
import { DataUnavailableMessage } from "@/features/shared/DataUnavailableMessage";
import { SeparatedList } from "@/features/shared/SeparatedList";

export function InfoFaqSection({ items }: { items: Faq[] }) {
  const [openFaqIndexes, setOpenFaqIndexes] = useState<Set<number>>(
    () => new Set(),
  );
  const formatQuestion = (question: string) =>
    question.replace(/^(Q\.\s*)+/i, "");

  return (
    <section className="container_infoList" aria-label="FAQ">
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
              <div
                className="container_infoFaqItem"
                data-state={isOpen ? "open" : "closed"}
              >
                <button
                  aria-controls={`info-faq-answer-${index}`}
                  aria-expanded={isOpen}
                  className="btn_infoFaqSummary"
                  id={`info-faq-summary-${index}`}
                  onClick={() => {
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
                  type="button"
                >
                  <span className="text_infoItemTitle">
                    Q. {formatQuestion(item.question)}
                  </span>
                  <span className="icon_infoChevron" aria-hidden="true" />
                </button>
                <div
                  aria-hidden={!isOpen}
                  aria-labelledby={`info-faq-summary-${index}`}
                  className="wrapper_infoFaqBodyMotion"
                  id={`info-faq-answer-${index}`}
                  role="region"
                >
                  <div className="wrapper_infoFaqBodyInner">
                    <p className="text_infoBody text_infoFaqBody">{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          }}
        />
      )}
    </section>
  );
}
