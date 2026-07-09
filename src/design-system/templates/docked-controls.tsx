import type { ReactNode } from "react";

import { cn } from "@/design-system/utils/cn";

type DockedControlsProps = {
  children: ReactNode;
  className?: string;
  isDetailOpen?: boolean;
};

export function DockedControls({
  children,
  className,
  isDetailOpen = false,
}: DockedControlsProps) {
  return (
    <div
      className={cn(
        "wrapper_homeDockedControls dockedControls",
        isDetailOpen && "is_detailOpen",
        className,
      )}
    >
      {children}
    </div>
  );
}
