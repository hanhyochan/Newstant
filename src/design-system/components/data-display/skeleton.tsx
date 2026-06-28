import { Fragment, type ReactNode } from "react";

import { cn } from "@/design-system/utils/cn";

export type SkeletonShape =
  | "text"
  | "title"
  | "chip"
  | "media"
  | "thumbnail"
  | "circle";

export type SkeletonWidth = "full" | "lg" | "md" | "sm" | "xs";

export type SkeletonProps = {
  className?: string;
  shape?: SkeletonShape;
  width?: SkeletonWidth;
};

export function Skeleton({
  className,
  shape = "text",
  width = "full",
}: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("skeleton", className)}
      data-shape={shape}
      data-width={width}
    />
  );
}

export function SkeletonList({
  count,
  renderItem,
}: {
  count: number;
  renderItem: (index: number) => ReactNode;
}) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <Fragment key={index}>{renderItem(index)}</Fragment>
      ))}
    </>
  );
}
