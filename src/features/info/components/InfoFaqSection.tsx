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
              <details
                className="container_infoFaqItem"
                onToggle={(event) => {
                  const isDetailOpen = event.currentTarget.open;

                  setOpenFaqIndexes((current) => {
                    const next = new Set(current);

                    if (isDetailOpen) {
                      next.add(index);
                    } else {
                      next.delete(index);
                    }

                    return next;
                  });
                }}
                open={isOpen}
              >
                <summary className="btn_infoFaqSummary">
                  <span className="text_infoItemTitle">
                    Q. {formatQuestion(item.question)}
                  </span>
                  <span className="icon_infoChevron" aria-hidden="true" />
                </summary>
                {isOpen ? (
                  <p className="text_infoBody text_infoFaqBody">{item.answer}</p>
                ) : null}
              </details>
            );
          }}
        />
      )}
    </section>
  );
}
