import { Skeleton } from "@/design-system/components/data-display/skeleton";

export function SearchResultSkeleton() {
  return (
    <div className="btn_searchResult" aria-hidden="true">
      <Skeleton shape="title" width="lg" />
      <Skeleton shape="text" width="sm" />
      <Skeleton shape="text" width="full" />
    </div>
  );
}
