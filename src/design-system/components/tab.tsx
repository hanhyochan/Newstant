"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { useId, useMemo, useState } from "react";

import { cn } from "./utils";

type TabSize = "small" | "medium" | "large";
type TabVariant = "filled" | "outline" | "gray_line_outline";
type TabRadius = "square" | "rounded" | "full";

export type TabItem = {
  disabled?: boolean;
  id: string;
  label: ReactNode;
  panel: ReactNode;
};

export type TabsProps = {
  className?: string;
  items: TabItem[];
  radius?: TabRadius;
  size?: TabSize;
  variant?: TabVariant;
  shape?: TabRadius;
};

export function Tabs({
  className,
  items,
  radius,
  shape,
  size = "medium",
  variant = "gray_line_outline",
}: TabsProps) {
  const resolvedRadius = radius ?? shape ?? "rounded";
  const generatedId = useId();
  const [activeIndex, setActiveIndex] = useState(0);
  const selected = items[activeIndex];

  const ids = useMemo(
    () =>
      items.map((item) => ({
        panelId: `${generatedId}-${item.id}-panel`,
        tabId: `${generatedId}-${item.id}-tab`,
      })),
    [generatedId, items],
  );

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const lastIndex = items.length - 1;
    const nextIndexByKey: Record<string, number> = {
      ArrowRight: activeIndex === lastIndex ? 0 : activeIndex + 1,
      ArrowDown: activeIndex === lastIndex ? 0 : activeIndex + 1,
      ArrowLeft: activeIndex === 0 ? lastIndex : activeIndex - 1,
      ArrowUp: activeIndex === 0 ? lastIndex : activeIndex - 1,
      Home: 0,
      End: lastIndex,
    };
    const nextIndex = nextIndexByKey[event.key];

    if (nextIndex === undefined) {
      return;
    }

    event.preventDefault();
    setActiveIndex(nextIndex);
  }

  return (
    <div className={cn("ds_stack", className)}>
      <div className="tab_group" role="tablist" onKeyDown={handleKeyDown}>
        {items.map((item, index) => (
          <button
            aria-controls={ids[index].panelId}
            aria-selected={index === activeIndex}
            className={cn(
              "tab",
              `tab_${size}`,
              `tab_${variant}`,
              resolvedRadius === "rounded" && "tab_rounded",
              resolvedRadius === "full" && "tab_full_rounded",
              item.disabled && "tab_disabled",
            )}
            disabled={item.disabled}
            id={ids[index].tabId}
            key={item.id}
            onClick={() => setActiveIndex(index)}
            role="tab"
            tabIndex={index === activeIndex ? 0 : -1}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
      {selected ? (
        <div
          aria-labelledby={ids[activeIndex].tabId}
          className="card"
          id={ids[activeIndex].panelId}
          role="tabpanel"
        >
          {selected.panel}
        </div>
      ) : null}
    </div>
  );
}
