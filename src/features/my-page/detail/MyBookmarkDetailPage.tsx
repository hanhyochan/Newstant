import {
  ChipLabel,
  PillTabMenu,
} from "@/design-system/components";
import { getEnterFromRightMotionClassName } from "@/design-system/templates";
import {
  AllNewsRelayItem,
  createAllNewsArticle,
  type AllNewsArticlePreview,
  type OpenArticleDetail,
  type PolicyItem,
} from "@/features/news/NewsViews";
import { DataUnavailableMessage } from "@/features/shared/DataUnavailableMessage";
import { SeparatedList } from "@/features/shared/SeparatedList";

export type MyBookmarkNewsSummaryItem = AllNewsArticlePreview & {
  bookmarkType: "news";
  category: string;
  newsCategory: string;
};

export type MyBookmarkPolicySummaryItem = {
  bookmarkType: "policy";
  category: string;
  policy: PolicyItem;
  summary: string;
  tags: string[];
  title: string;
};

export type MyBookmarkSummaryItem =
  | MyBookmarkNewsSummaryItem
  | MyBookmarkPolicySummaryItem;

function isAllCategory(category: string) {
  return category === "전체";
}

function getVisibleItems(
  items: MyBookmarkSummaryItem[],
  activeCategory: string,
) {
  return isAllCategory(activeCategory)
    ? items
    : items.filter((item) => item.category === activeCategory);
}

export function MyBookmarkDetailPage({
  activeCategory,
  items,
  isLeaving = false,
  onCategoryChange,
  onOpenArticle,
  onOpenPolicy,
  showTabs,
  tabs,
}: {
  activeCategory: string;
  items: MyBookmarkSummaryItem[];
  isLeaving?: boolean;
  onCategoryChange: (category: string) => void;
  onOpenArticle: OpenArticleDetail;
  onOpenPolicy: (policy: PolicyItem) => void;
  showTabs: boolean;
  tabs: string[];
}) {
  const visibleBookmarkItems = showTabs
    ? getVisibleItems(items, activeCategory)
    : items;

  return (
    <div
      className={`container_myBookmarkPage ${getEnterFromRightMotionClassName(isLeaving)}`}
    >
      <h2 className="text_mySectionTitle">북마크</h2>
      <div className="wrapper_myTabbedDetailContent">
      {showTabs ? (
        <PillTabMenu
          ariaLabel="북마크 뉴스 카테고리"
          className="tab_myCategoryMenu"
          items={tabs.map((category) => ({
            id: category,
            label: category,
          }))}
          onChange={onCategoryChange}
          value={activeCategory}
        />
      ) : null}
      <div className="wrapper_myBookmarkList">
        {visibleBookmarkItems.length === 0 ? (
          <DataUnavailableMessage target="북마크" />
        ) : (
          <SeparatedList
            dividerClassName="divider_mySection"
            getKey={(item, index) => `${item.title}-${index}`}
            items={visibleBookmarkItems}
            renderItem={(item, index) => (
              item.bookmarkType === "news" ? (
                <AllNewsRelayItem
                  featured={index === 0 || index === 5}
                  item={item}
                  onClick={() =>
                    onOpenArticle(
                      createAllNewsArticle(item, item.newsCategory, index),
                    )
                  }
                />
              ) : (
                <button
                  className="newsroll_policy_list_item"
                  onClick={() => onOpenPolicy(item.policy)}
                  type="button"
                >
                  <div className="newsroll_policy_list_tags">
                    {item.tags.map((tag, tagIndex) => (
                      <ChipLabel
                        kind={tagIndex === item.tags.length - 1 ? "policyAccent" : "policy"}
                        key={`${item.title}-${tag}`}
                      >
                        {tag}
                      </ChipLabel>
                    ))}
                  </div>
                  <div className="wrapper_policyItemContent">
                    <h2>{item.title}</h2>
                    <p className="text_infoBody text_lineClamp2">{item.summary}</p>
                  </div>
                </button>
              )
            )}
          />
        )}
      </div>
      </div>
    </div>
  );
}
