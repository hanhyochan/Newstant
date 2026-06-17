import { getEnterFromRightMotionClassName } from "@/design-system/templates";
import {
  AllNewsRelayItem,
  homeArticle,
  homeArticles,
  type HomeArticle,
  type OpenArticleDetail,
} from "@/features/news/NewsViews";
import { DataUnavailableMessage } from "@/features/shared/DataUnavailableMessage";
import { SeparatedList } from "@/features/shared/SeparatedList";

export type MyRecentSummaryItem = {
  article: HomeArticle;
  dateTime: string;
  image: string;
  time: string;
  title: string;
};

export function createMyRecentArticle(
  item: MyRecentSummaryItem,
  index: number,
): HomeArticle {
  const fallbackArticle = homeArticles[index % homeArticles.length] ?? homeArticle;

  return {
    ...fallbackArticle,
    ...item.article,
    date: item.time,
    image: item.image,
    imageAlt: item.article.imageAlt,
    title: item.title,
  };
}

export function MyRecentDetailPage({
  items,
  isLeaving = false,
  onOpenArticle,
}: {
  items: MyRecentSummaryItem[];
  isLeaving?: boolean;
  onOpenArticle: OpenArticleDetail;
}) {
  return (
    <div
      className={`container_myBookmarkPage ${getEnterFromRightMotionClassName(isLeaving)}`}
    >
      <h2 className="text_mySectionTitle">최근 본 뉴스</h2>
      {items.length === 0 ? (
        <DataUnavailableMessage target="최근 본 뉴스" />
      ) : (
        <SeparatedList
          dividerClassName="newsroll_all_itemDivider"
          getKey={(item, index) => `${item.title}-${index}`}
          items={items}
          renderItem={(item, index) => (
            <AllNewsRelayItem
              featured={index === 0 || index === 5}
              item={item}
              onClick={() => onOpenArticle(createMyRecentArticle(item, index))}
            />
          )}
        />
      )}
    </div>
  );
}
