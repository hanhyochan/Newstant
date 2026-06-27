import type { ReactNode } from "react";

import { cn } from "@/design-system/utils/cn";

export type DateTimeTextProps = {
  children: ReactNode;
  className?: string;
  dateTime?: string;
};

export function DateTimeText({
  children,
  className,
  dateTime,
}: DateTimeTextProps) {
  return (
    <time className={cn("text_createdTime", className)} dateTime={dateTime}>
      {children}
    </time>
  );
}
