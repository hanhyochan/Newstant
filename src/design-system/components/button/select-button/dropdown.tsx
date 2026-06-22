import {
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

import { IconButton } from "../icon-button";
import {
  FloatingMenuItem,
  FloatingMenuPanel,
  useFloatingMenuDismiss,
  type FloatingMenuPanelAlign,
  type UseFloatingMenuDismissProps,
} from "./floating-menu";

export type UseDropdownDismissProps = UseFloatingMenuDismissProps;

export const useDropdownDismiss = useFloatingMenuDismiss;

export type DropdownOption<T extends string> = {
  label: ReactNode;
  value: T;
};

export type DropdownProps<T extends string> = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "onSelect"
> & {
  align?: FloatingMenuPanelAlign;
  buttonLabel: string;
  isOpen: boolean;
  menuClassName?: string;
  menuId: string;
  onOpenChange: (isOpen: boolean) => void;
  onSelect: (value: T) => void;
  options: Array<DropdownOption<T>>;
};

export function Dropdown<T extends string>({
  align = "end",
  buttonLabel,
  disabled,
  isOpen,
  menuClassName,
  menuId,
  onOpenChange,
  onSelect,
  options,
  ...props
}: DropdownProps<T>) {
  return (
    <span className="wrapper_commentAction">
      <IconButton
        {...props}
        aria-controls={isOpen ? menuId : undefined}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        baseClassName="btn_commentAction"
        disabled={disabled}
        icon="detail"
        label={buttonLabel}
        onClick={() => onOpenChange(!isOpen)}
      />
      {isOpen ? (
        <FloatingMenuPanel
          align={align}
          className={menuClassName}
          id={menuId}
          role="menu"
        >
          {options.map((option) => (
            <FloatingMenuItem
              key={option.value}
              onClick={() => onSelect(option.value)}
              role="menuitem"
            >
              {option.label}
            </FloatingMenuItem>
          ))}
        </FloatingMenuPanel>
      ) : null}
    </span>
  );
}
