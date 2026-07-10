import type { ReactNode } from "react";

import { DateTimeText } from "@/design-system/components/data-display/date-time-text";

export type NewsCardMetaProps = {
  date?: ReactNode;
  dateTime?: string;
};

export function NewsCardMeta({
  date = "0000년 00월 00일",
  dateTime = "2026-12-31T08:30:00",
}: NewsCardMetaProps) {
  return (
    <p className="wrapper_newsCardMeta">
      <DateTimeText dateTime={dateTime}>
        {date}
      </DateTimeText>
    </p>
  );
}
