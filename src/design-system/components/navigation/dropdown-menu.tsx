import { useEffect, useId, useRef, type HTMLAttributes } from "react";

import { cn } from "../shared/utils";

export type NewsRollDropdownOption<T extends string> = {
  label: string;
  value: T;
};

export type NewsRollDropdownArrowProps = HTMLAttributes<HTMLSpanElement>;

export function NewsRollDropdownArrow({ className, ...props }: NewsRollDropdownArrowProps) {
  return <span {...props} aria-hidden="true" className={cn("newsroll_dropdownArrow", className)} />;
}

export type NewsRollDropdownMenuProps<T extends string> = {
  ariaLabel: string;
  buttonClassName?: string;
  className?: string;
  isOpen: boolean;
  listboxClassName?: string;
  listboxId?: string;
  onChange: (value: T) => void;
  onOpenChange: (isOpen: boolean) => void;
  options: Array<NewsRollDropdownOption<T>>;
  value: T;
};

export function NewsRollDropdownMenu<T extends string>({
  ariaLabel,
  buttonClassName,
  className,
  isOpen,
  listboxClassName,
  listboxId,
  onChange,
  onOpenChange,
  options,
  value,
}: NewsRollDropdownMenuProps<T>) {
  const generatedListboxId = useId();
  const resolvedListboxId = listboxId ?? generatedListboxId;
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find((option) => option.value === value)?.label ?? "";

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function closeOnPointerDown(event: globalThis.PointerEvent) {
      const target = event.target;

      if (target instanceof Node && rootRef.current?.contains(target)) {
        return;
      }

      onOpenChange(false);
    }

    function closeOnEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }

    document.addEventListener("pointerdown", closeOnPointerDown);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnPointerDown);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen, onOpenChange]);

  return (
    <div className={cn("wrapper_commentDropdown", className)} ref={rootRef}>
      <button
        aria-controls={isOpen ? resolvedListboxId : undefined}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className={cn("btn_commentDropdown", buttonClassName)}
        onClick={() => onOpenChange(!isOpen)}
        type="button"
      >
        {selectedLabel}
        <NewsRollDropdownArrow />
      </button>
      {isOpen ? (
        <div className={cn("listbox_commentDropdown", listboxClassName)} id={resolvedListboxId} role="listbox">
          {options.map((option) => (
            <button
              aria-selected={value === option.value}
              key={option.value}
              onClick={() => {
                onChange(option.value);
                onOpenChange(false);
              }}
              role="option"
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
