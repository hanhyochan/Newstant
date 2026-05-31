import type { KeyboardEvent } from "react";
import type { ReactNode } from "react";

import { cn } from "../shared/utils";

export type PillTabItem<T extends string> = {
  id: T;
  label: string;
};

export type PillTabMenuRole = "group" | "radiogroup" | "tablist";
export type PillTabMenuState = "active" | "default" | "selected";

export type PillTabMenuProps<T extends string> = {
  ariaLabel: string;
  className: string;
  getButtonClassName?: (id: T) => string | undefined;
  getItemState?: (id: T) => PillTabMenuState;
  getItemAriaLabel?: (id: T) => string | undefined;
  getPanelId?: (id: T) => string | undefined;
  getTabId?: (id: T) => string;
  items: PillTabItem<T>[];
  keyboardNavigation?: boolean;
  onChange: (id: T) => void;
  renderItemContent?: (item: PillTabItem<T>) => ReactNode;
  role?: PillTabMenuRole;
  value: T;
};

export function PillTabMenu<T extends string>({
  ariaLabel,
  className,
  getButtonClassName,
  getItemAriaLabel,
  getItemState,
  getPanelId,
  getTabId,
  items,
  keyboardNavigation = true,
  onChange,
  renderItemContent,
  role = "tablist",
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
    if (keyboardNavigation) {
      onChange(items[nextIndex].id);
    }
  }

  return (
    <div
      className={className}
      role={role}
      aria-label={ariaLabel}
      onKeyDown={keyboardNavigation ? handleKeyDown : undefined}
    >
      {items.map((item) => {
        const itemState = getItemState?.(item.id) ?? (value === item.id ? "active" : "default");
        const isActive = itemState === "active";
        const isSelected = itemState === "selected";

        return (
          <button
            aria-checked={role === "radiogroup" ? isActive : undefined}
            aria-controls={role === "tablist" ? getPanelId?.(item.id) : undefined}
            aria-label={getItemAriaLabel?.(item.id)}
            aria-pressed={role === "group" ? isActive || isSelected : undefined}
            aria-selected={role === "tablist" ? isActive : undefined}
            className={cn(
              "tab",
              "tab_medium",
              "tab_filled",
              "tab_full_rounded",
              getButtonClassName?.(item.id),
            )}
            data-state={itemState}
            id={getTabId?.(item.id)}
            key={item.id}
            onClick={() => onChange(item.id)}
            role={role === "tablist" ? "tab" : role === "radiogroup" ? "radio" : undefined}
            tabIndex={role === "group" ? 0 : isActive ? 0 : -1}
            type="button"
          >
            {renderItemContent?.(item) ?? item.label}
          </button>
        );
      })}
    </div>
  );
}
