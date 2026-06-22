import { useRef } from "react";

import {
  FloatingMenuItem,
  FloatingMenuPanel,
  useFloatingMenuDismiss,
} from "./floating-menu";

export type SelectButtonOption<T extends string> = {
  label: string;
  value: T;
};

export type SelectButtonSize = "default" | "small";

export type SelectButtonProps<T extends string> = {
  ariaLabel: string;
  isOpen: boolean;
  listboxId: string;
  onChange: (value: T) => void;
  onOpenChange: (isOpen: boolean) => void;
  options: Array<SelectButtonOption<T>>;
  size?: SelectButtonSize;
  value: T;
};

export function SelectButton<T extends string>({
  ariaLabel,
  isOpen,
  listboxId,
  onChange,
  onOpenChange,
  options,
  size = "small",
  value,
}: SelectButtonProps<T>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find((option) => option.value === value)?.label ?? "";

  useFloatingMenuDismiss({
    enabled: isOpen,
    onDismiss: () => onOpenChange(false),
    rootRef,
  });

  return (
    <div
      className="wrapper_dropdownSelect"
      data-size={size}
      ref={rootRef}
    >
      <button
        aria-controls={isOpen ? listboxId : undefined}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className="btn_dropdownSelect"
        data-size={size}
        onClick={() => onOpenChange(!isOpen)}
        type="button"
      >
        {selectedLabel}
        <span aria-hidden="true" className="newsroll_dropdownArrow" />
      </button>
      {isOpen ? (
        <FloatingMenuPanel
          className="listbox_dropdownSelect"
          id={listboxId}
          role="listbox"
          size={size}
        >
          {options.map((option) => (
            <FloatingMenuItem
              aria-selected={value === option.value}
              key={option.value}
              onClick={() => {
                onChange(option.value);
                onOpenChange(false);
              }}
              role="option"
            >
              {option.label}
            </FloatingMenuItem>
          ))}
        </FloatingMenuPanel>
      ) : null}
    </div>
  );
}
