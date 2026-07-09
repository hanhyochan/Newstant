import { Skeleton } from "@/design-system/components/data-display/skeleton";

export function NewsBlockCardSkeleton() {
  return (
    <div className="btn_newsCardBlock wrapper_contentMeta u_gap8" aria-hidden="true">
      <span className="wrapper_newsCardKicker">
        <Skeleton shape="chip" width="xs" />
      </span>
      <Skeleton className="img_newsCardBlock" shape="media" />
      <span className="wrapper_contentMeta u_minH0 u_gap8">
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
    <div className="btn_newsCardFeature wrapper_contentMeta u_gap8" aria-hidden="true">
      <Skeleton shape="chip" width="xs" />
      <Skeleton className="img_newsCardFeature" shape="media" />
      <span className="wrapper_contentMeta u_minH0 u_gap8">
        <Skeleton shape="title" width="full" />
        <Skeleton shape="title" width="md" />
        <Skeleton shape="text" width="sm" />
      </span>
    </div>
  );
}

export function NewsReelCardSkeleton() {
  return (
    <article
      aria-hidden="true"
      className="container_articleCard wrapper_panelSurface_style"
    >
      <div className="wrapper_articleCardContent wrapper_panelContent u_minH0 u_gap24">
        <Skeleton shape="chip" width="xs" />
        <Skeleton shape="title" width="full" />
        <Skeleton shape="text" width="sm" />
        <Skeleton shape="media" />
        <span className="wrapper_contentMeta u_minH0 u_gap8">
          <Skeleton shape="text" width="full" />
          <Skeleton shape="text" width="lg" />
          <Skeleton shape="text" width="md" />
        </span>
      </div>
    </article>
  );
}

export function NewsHeadlineRowSkeleton() {
  return (
    <div className="btn_newsCardRow wrapper_betweenRow" aria-hidden="true">
      <span className="wrapper_contentMeta u_flex1 u_gap8">
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
    <div className="btn_newsCardList wrapper_contentMeta u_gap8" aria-hidden="true">
      <Skeleton shape="title" width="full" />
      <Skeleton shape="title" width="lg" />
      <Skeleton shape="text" width="sm" />
      <Skeleton shape="media" />
    </div>
  );
}
