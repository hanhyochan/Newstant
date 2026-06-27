import type { ReactNode } from "react";

import { cn } from "@/design-system/utils/cn";

type NewsRollTopFrameProps = {
  footer?: ReactNode;
  headerBody?: ReactNode;
  headerClassName?: string;
  headerControls?: ReactNode;
  hero?: ReactNode;
  toolbar?: ReactNode;
};

export function NewsRollTopFrame({
  footer,
  headerBody,
  headerClassName,
  headerControls,
  hero,
  toolbar,
}: NewsRollTopFrameProps) {
  const hasHeader =
    toolbar !== undefined || headerControls !== undefined || headerBody !== undefined;

  return (
    <>
      {hasHeader ? (
        <div
          className={cn(
            "container_homeToolbar",
            "headerTop",
            "all_breakingHeader",
            headerClassName,
          )}
        >
          {toolbar}
          {headerControls}
          {headerBody}
        </div>
      ) : null}
      {hero}
      {footer}
    </>
  );
}
