import { ContentSummaryButton, Skeleton } from "@/design-system/components";
import { SeparatedList } from "@/features/shared/SeparatedList";

export type InfoNoticeItem = {
  content: string;
  date: string;
  id: string;
  summary: string;
  title: string;
  updatedAt: string;
};

const noticeSkeletonItems = Array.from({ length: 5 }, (_, index) => index);

export function InfoNoticeSection({
  items,
  onNoticeSelect,
}: {
  items: InfoNoticeItem[];
  onNoticeSelect: (notice: InfoNoticeItem, index: number) => void;
}) {
  return (
    <section className="container_infoList wrapper_scrollList" aria-label="공지사항">
      {items.length === 0 ? (
        <SeparatedList
          dividerClassName="divider_infoSection"
          dividerPlacement="inside-wrapped-item"
          getKey={(item) => `notice-skeleton-${item}`}
          items={noticeSkeletonItems}
          renderItem={() => (
            <div aria-hidden="true" className="btn_noticeListItem">
              <div className="wrapper_contentMeta">
                <Skeleton shape="title" width="lg" />
                <Skeleton shape="text" width="full" />
                <Skeleton shape="text" width="sm" />
              </div>
            </div>
          )}
        />
      ) : (
        <SeparatedList
          dividerClassName="divider_infoSection"
          dividerPlacement="inside-wrapped-item"
          getKey={(notice, index) => `${notice.title}-${notice.date}-${index}`}
          items={items}
          renderItem={(notice, index) => (
            <ContentSummaryButton
              className="btn_noticeListItem"
              onClick={() => onNoticeSelect(notice, index)}
            >
              <div className="wrapper_contentMeta">
                <span className="text_infoItemTitle">{notice.title}</span>
                <p className="text_infoBody text_lineClamp2">
                  {notice.summary}
                </p>
                <span className="text_infoMeta">{notice.date}</span>
              </div>
            </ContentSummaryButton>
          )}
        />
      )}
    </section>
  );
}
