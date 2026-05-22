import type { ReactNode } from "react";

import { cn } from "../components/shared/utils";

type NewsRollDockedControlsProps = {
  children: ReactNode;
  className?: string;
  isDetailOpen?: boolean;
};

export function NewsRollDockedControls({
  children,
  className,
  isDetailOpen = false,
}: NewsRollDockedControlsProps) {
  return (
    <div
      className={cn(
        "wrapper_homeDockedControls newsroll_dockedControls",
        isDetailOpen && "is_detailOpen",
        className,
      )}
    >
      {children}
    </div>
  );
}
