import { Fragment, type ReactNode } from "react";

import { NewsRollDivider } from "@/design-system/components";

type DividerPlacement = "after-wrapped-item" | "before-item" | "inside-wrapped-item";

export type SeparatedListProps<T> = {
  dividerClassName?: string;
  dividerPlacement?: DividerPlacement;
  getKey: (item: T, index: number) => string;
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
};

function Divider({ className }: { className: string }) {
  return <NewsRollDivider className={className} />;
}

export function SeparatedList<T>({
  dividerClassName = "newsroll_divider_horizontal",
  dividerPlacement = "before-item",
  getKey,
  items,
  renderItem,
}: SeparatedListProps<T>) {
  return (
    <>
      {items.map((item, index) => {
        const key = getKey(item, index);

        if (dividerPlacement === "after-wrapped-item") {
          return (
            <Fragment key={key}>
              <div className="wrapper_separatedItem">
                {renderItem(item, index)}
              </div>
              {index < items.length - 1 ? (
                <Divider className={dividerClassName} />
              ) : null}
            </Fragment>
          );
        }

        if (dividerPlacement === "inside-wrapped-item") {
          return (
            <div className="wrapper_separatedItem" key={key}>
              {renderItem(item, index)}
              {index < items.length - 1 ? (
                <Divider className={dividerClassName} />
              ) : null}
            </div>
          );
        }

        return (
          <Fragment key={key}>
            {index > 0 ? (
              <NewsRollDivider className={dividerClassName} />
            ) : null}
            {renderItem(item, index)}
          </Fragment>
        );
      })}
    </>
  );
}
