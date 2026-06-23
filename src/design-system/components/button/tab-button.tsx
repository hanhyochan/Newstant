import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { cn } from "../shared/utils";

export type TabButtonState = "active" | "default";

export interface TabButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  dataState?: string;
  state?: TabButtonState;
}

export const TabButton = forwardRef<HTMLButtonElement, TabButtonProps>(
  function TabButton(
    {
      children,
      className,
      dataState,
      state = "default",
      type = "button",
      ...props
    },
    ref,
  ) {
    return (
      <button
        {...props}
        className={cn(
          "tab",
          "tab_medium",
          "tab_filled",
          "tab_full_rounded",
          className,
        )}
        data-state={dataState ?? state}
        ref={ref}
        type={type}
      >
        {children}
      </button>
    );
  },
);
