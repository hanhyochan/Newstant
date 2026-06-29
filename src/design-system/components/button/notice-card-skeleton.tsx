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
  const isBreaking = type === "breaking";

  return (
    <div
      aria-hidden="true"
      className={cn(
        baseClassName,
        "noticeCardLink",
        "noticeCardLink_" + type,
        isBreaking && "noticeCardSkeleton",
      )}
    >
      {isBreaking ? null : <Skeleton shape="title" width="lg" />}
    </div>
  );
}
