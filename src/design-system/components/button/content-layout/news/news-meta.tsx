import type { ReactNode } from "react";

import { DateTimeText } from "@/design-system/components/data-display/date-time-text";

export type NewsCardMetaProps = {
  date?: ReactNode;
  dateTime?: string;
};

export function NewsCardMeta({
  date = "2026년 12월 31일 08:30",
  dateTime = "2026-12-31T08:30:00",
}: NewsCardMetaProps) {
  return (
    <p className="newsroll_all_meta">
      <DateTimeText className="newsroll_createdTime" dateTime={dateTime}>
        {date}
      </DateTimeText>
    </p>
  );
}
