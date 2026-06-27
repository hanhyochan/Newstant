import type { ReactNode } from "react";

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
    <time className={className} dateTime={dateTime}>
      {children}
    </time>
  );
}
