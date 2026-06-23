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

export type UseActionMenuDismissProps = UseFloatingMenuDismissProps;

export const useActionMenuDismiss = useFloatingMenuDismiss;

export type ActionMenuOption<T extends string> = {
  label: ReactNode;
  value: T;
};

export type ActionMenuProps<T extends string> = Omit<
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
  options: Array<ActionMenuOption<T>>;
};

export function ActionMenu<T extends string>({
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
}: ActionMenuProps<T>) {
  return (
    <span className="wrapper_commentAction">
      <IconButton
        {...props}
        aria-controls={isOpen ? menuId : undefined}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="btn_commentAction"
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
