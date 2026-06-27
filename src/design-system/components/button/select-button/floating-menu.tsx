import {
  useEffect,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type RefObject,
} from "react";

import { cn } from "@/design-system/utils/cn";

export type FloatingMenuPanelAlign = "start" | "end";
export type FloatingMenuPanelSize = "default" | "small";

export type FloatingMenuPanelProps = HTMLAttributes<HTMLDivElement> & {
  align?: FloatingMenuPanelAlign;
  size?: FloatingMenuPanelSize;
};

export function FloatingMenuPanel({
  align = "start",
  children,
  className,
  size = "small",
  ...props
}: FloatingMenuPanelProps) {
  return (
    <div
      className={cn("panel_dropdown", className)}
      data-align={align}
      data-size={size}
      {...props}
    >
      {children}
    </div>
  );
}

export type FloatingMenuItemProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function FloatingMenuItem({
  children,
  className,
  type = "button",
  ...props
}: FloatingMenuItemProps) {
  return (
    <button className={cn("btn_dropdownItem", className)} type={type} {...props}>
      {children}
    </button>
  );
}

export type UseFloatingMenuDismissProps = {
  enabled: boolean;
  ignoreSelector?: string;
  onDismiss: () => void;
  rootRef?: RefObject<HTMLElement>;
};

export function useFloatingMenuDismiss({
  enabled,
  ignoreSelector,
  onDismiss,
  rootRef,
}: UseFloatingMenuDismissProps) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    function closeOnPointerDown(event: globalThis.PointerEvent) {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      if (rootRef?.current?.contains(target)) {
        return;
      }

      if (ignoreSelector && target.closest(ignoreSelector)) {
        return;
      }

      onDismiss();
    }

    function closeOnEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        onDismiss();
      }
    }

    document.addEventListener("pointerdown", closeOnPointerDown);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnPointerDown);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [enabled, ignoreSelector, onDismiss, rootRef]);
}
