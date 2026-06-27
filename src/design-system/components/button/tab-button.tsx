import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/design-system/utils/cn";

export type TabButtonState = "active" | "default" | "selected";

export interface TabButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  state?: TabButtonState;
}

export const TabButton = forwardRef<HTMLButtonElement, TabButtonProps>(
  function TabButton(
    {
      children,
      className,
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
          "btn_tab",
          className,
        )}
        data-state={state}
        ref={ref}
        type={type}
      >
        {children}
      </button>
    );
  },
);
