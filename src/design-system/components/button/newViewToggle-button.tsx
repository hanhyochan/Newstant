import {
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { cn } from "../shared/utils";

export type NewViewToggleButtonItem<T extends string> = {
  id: T;
  label: string;
};

export type NewViewToggleButtonProps<T extends string> = {
  ariaLabel: string;
  className?: string;
  getButtonClassName?: (id: T) => string | undefined;
  getItemAriaLabel?: (id: T) => string | undefined;
  getPanelId?: (id: T) => string | undefined;
  getTabId?: (id: T) => string;
  items: NewViewToggleButtonItem<T>[];
  onChange: (id: T) => void;
  renderItemContent?: (item: NewViewToggleButtonItem<T>) => ReactNode;
  value: T;
};

export function NewViewToggleButton<T extends string>({
  ariaLabel,
  className,
  getButtonClassName,
  getItemAriaLabel,
  getPanelId,
  getTabId,
  items,
  onChange,
  renderItemContent,
  value,
}: NewViewToggleButtonProps<T>) {
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === value),
  );
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

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
    buttonRefs.current[nextIndex]?.focus();
  }

  return (
    <div
      aria-label={ariaLabel}
      className={cn("wrapper_toggleButtonGroup", className)}
      onKeyDown={handleKeyDown}
      role="tablist"
    >
      {items.map((item, index) => {
        const isActive = value === item.id;

        return (
          <button
            aria-controls={isActive ? getPanelId?.(item.id) : undefined}
            aria-label={getItemAriaLabel?.(item.id)}
            aria-selected={isActive}
            className={cn(
              "btn_newViewToggleOption",
              getButtonClassName?.(item.id),
            )}
            data-state={isActive ? "active" : "default"}
            id={getTabId?.(item.id)}
            key={item.id}
            onClick={() => onChange(item.id)}
            ref={(node) => {
              buttonRefs.current[index] = node;
            }}
            role="tab"
            tabIndex={isActive ? 0 : -1}
            type="button"
          >
            {renderItemContent?.(item) ?? item.label}
          </button>
        );
      })}
    </div>
  );
}
