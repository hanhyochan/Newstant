import { Skeleton } from "@/design-system/components/data-display/skeleton";

export function NewsBlockCardSkeleton() {
  return (
    <div className="btn_newsCardBlock wrapper_contentMeta" aria-hidden="true">
      <span className="wrapper_newsCardKicker">
        <Skeleton shape="chip" width="xs" />
      </span>
      <Skeleton className="img_newsCardBlock" shape="media" />
      <span className="wrapper_contentMeta u_minH0">
        <Skeleton shape="title" width="full" />
        <Skeleton shape="title" width="md" />
      </span>
      <p className="wrapper_newsCardDateRow wrapper_betweenRow u_m0">
        <Skeleton className="text_createdTime" shape="text" width="sm" />
      </p>
    </div>
  );
}

export function NewsFeatureCardSkeleton() {
  return (
    <div className="btn_newsCardFeature wrapper_contentMeta" aria-hidden="true">
      <Skeleton shape="chip" width="xs" />
      <Skeleton className="img_newsCardFeature" shape="media" />
      <span className="wrapper_contentMeta u_minH0">
        <Skeleton shape="title" width="full" />
        <Skeleton shape="title" width="md" />
        <Skeleton shape="text" width="sm" />
      </span>
    </div>
  );
}

export function NewsHeadlineRowSkeleton() {
  return (
    <div className="btn_newsCardRow wrapper_betweenRow" aria-hidden="true">
      <span className="wrapper_contentMeta u_flex1">
        <Skeleton shape="title" width="full" />
        <Skeleton shape="title" width="lg" />
        <Skeleton shape="text" width="sm" />
      </span>
      <Skeleton className="img_newsCardThumbnail" shape="thumbnail" />
    </div>
  );
}

export function NewsListCardSkeleton() {
  return (
    <div className="btn_newsCardList wrapper_contentMeta" aria-hidden="true">
      <Skeleton shape="title" width="full" />
      <Skeleton shape="title" width="lg" />
      <Skeleton shape="text" width="sm" />
      <Skeleton shape="media" />
    </div>
  );
}
