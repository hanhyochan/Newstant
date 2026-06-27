import { ContentSummaryButton } from "@/design-system/components";
import { DataUnavailableMessage } from "@/features/shared/DataUnavailableMessage";
import { SeparatedList } from "@/features/shared/SeparatedList";

export type InfoNoticeItem = {
  content: string;
  date: string;
  id: string;
  summary: string;
  title: string;
  updatedAt: string;
};

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
        <DataUnavailableMessage target="공지사항" />
      ) : (
        <SeparatedList
          dividerClassName="divider_infoSection"
          dividerPlacement="inside-wrapped-item"
          getKey={(notice, index) => `${notice.title}-${notice.date}-${index}`}
          items={items}
          renderItem={(notice, index) => (
            <ContentSummaryButton
              className="btn_infoNoticeItem"
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
