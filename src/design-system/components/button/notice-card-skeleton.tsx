import { Skeleton } from "@/design-system/components/data-display/skeleton";
import { cn } from "@/design-system/utils/cn";

import type { NoticeCardLinkType } from "./notice-card-link";

export function NoticeCardSkeleton({
  isListItem = false,
  type = "breaking",
}: {
  isListItem?: boolean;
  type?: NoticeCardLinkType;
}) {
  const baseClassName = isListItem ? "btn_noticeListCardLink" : "btn_noticeCardLink";

  return (
    <div
      aria-hidden="true"
      className={cn(baseClassName, "noticeCardLink", "noticeCardLink_" + type)}
    >
      <Skeleton shape="title" width="lg" />
    </div>
  );
}
