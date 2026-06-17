import { useState } from "react";

import { type Faq } from "@/app/_newsroll/api";
import { DataUnavailableMessage } from "@/features/shared/DataUnavailableMessage";
import { SeparatedList } from "@/features/shared/SeparatedList";

export function InfoFaqSection({ items }: { items: Faq[] }) {
  const [openFaqIndexes, setOpenFaqIndexes] = useState<Set<number>>(
    () => new Set(),
  );

  return (
    <section className="container_infoList" aria-label="FAQ">
      {items.length === 0 ? (
        <DataUnavailableMessage target="FAQ" />
      ) : (
        <SeparatedList
          dividerClassName="divider_infoSection"
          dividerPlacement="inside-wrapped-item"
          getKey={(item, index) => `${item.question}-${index}`}
          items={items}
          renderItem={(item, index) => (
            <details
              className="container_infoFaqItem"
              onToggle={(event) => {
                const isOpen = event.currentTarget.open;

                setOpenFaqIndexes((current) => {
                  const next = new Set(current);

                  if (isOpen) {
                    next.add(index);
                  } else {
                    next.delete(index);
                  }

                  return next;
                });
              }}
              open={openFaqIndexes.has(index)}
            >
              <summary className="btn_infoFaqSummary">
                <span className="text_infoItemTitle">Q. {item.question}</span>
                <span className="icon_infoChevron" aria-hidden="true" />
              </summary>
              <p className="text_infoBody text_infoFaqBody">{item.answer}</p>
            </details>
          )}
        />
      )}
    </section>
  );
}
