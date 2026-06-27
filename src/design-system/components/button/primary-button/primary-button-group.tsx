import type { ReactNode } from "react";

import { cn } from "@/design-system/utils/cn";

export type PrimaryButtonGroupColumns = 1 | 2;

export type PrimaryButtonGroupProps = {
  children: ReactNode;
  className?: string;
  columns?: PrimaryButtonGroupColumns;
};

export function PrimaryButtonGroup({
  children,
  className,
  columns = 1,
}: PrimaryButtonGroupProps) {
  return (
    <div
      className={cn(
        "wrapper_primaryButtonGroup",
        columns === 2 && "wrapper_primaryButtonGroup_twoColumns",
        className,
      )}
    >
      {children}
    </div>
  );
}
