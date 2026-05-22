import type { KeyboardEvent } from "react";

export type PillTabItem<T extends string> = {
  id: T;
  label: string;
};

export type PillTabMenuProps<T extends string> = {
  ariaLabel: string;
  className: string;
  getPanelId?: (id: T) => string | undefined;
  getTabId?: (id: T) => string;
  items: PillTabItem<T>[];
  onChange: (id: T) => void;
  value: T;
};

export function PillTabMenu<T extends string>({
  ariaLabel,
  className,
  getPanelId,
  getTabId,
  items,
  onChange,
  value,
}: PillTabMenuProps<T>) {
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === value),
  );

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const lastIndex = items.length - 1;
    const nextIndexByKey: Record<string, number> = {
      ArrowDown: activeIndex === lastIndex ? 0 : activeIndex + 1,
      ArrowLeft: activeIndex === 0 ? lastIndex : activeIndex - 1,
      ArrowRight: activeIndex === lastIndex ? 0 : activeIndex + 1,
      ArrowUp: activeIndex === 0 ? lastIndex : activeIndex - 1,
      End: lastIndex,
      Home: 0,
    };
    const nextIndex = nextIndexByKey[event.key];

    if (nextIndex === undefined) {
      return;
    }

    event.preventDefault();
    onChange(items[nextIndex].id);
  }

  return (
    <div className={className} role="tablist" aria-label={ariaLabel} onKeyDown={handleKeyDown}>
      {items.map((item) => {
        const selected = value === item.id;

        return (
          <button
            aria-controls={getPanelId?.(item.id)}
            aria-selected={selected}
            id={getTabId?.(item.id)}
            key={item.id}
            onClick={() => onChange(item.id)}
            role="tab"
            tabIndex={selected ? 0 : -1}
            type="button"
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
