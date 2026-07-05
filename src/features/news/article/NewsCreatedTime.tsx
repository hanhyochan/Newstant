import type { ReactNode } from "react";

import { DateTimeText } from "@/design-system/components";
import {
  defaultNewsDateLabel,
  defaultNewsDateTime,
} from "@/features/news/model";

export function NewsCreatedTime({
  children = defaultNewsDateLabel,
  dateTime = defaultNewsDateTime,
}: {
  children?: ReactNode;
  dateTime?: string;
}) {
  return (
    <DateTimeText dateTime={dateTime}>
      {children}
    </DateTimeText>
  );
}