import {
  ChipLabel,
  ContentSummaryButton,
  PillTabMenu,
  NewsListCardButton as AllNewsRelayItem,
} from "@/design-system/components";
import { getEnterFromRightMotionClassName } from "@/design-system/templates";
import {
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

export type MyBookmarkTypeTab = "news" | "policy";

const bookmarkTypeTabs: Array<{ id: MyBookmarkTypeTab; label: string }> = [
  { id: "news", label: "뉴스" },
  { id: "policy", label: "국가정책" },
];

function isAllCategory(category: string) {
  return category === "전체";
}

function getVisibleNewsItems(
  items: MyBookmarkNewsSummaryItem[],
  activeCategory: string,
) {
  return isAllCategory(activeCategory)
    ? items
    : items.filter((item) => item.newsCategory === activeCategory);
}

export function MyBookmarkDetailPage({
  activeNewsCategory,
  activeType,
  items,
  isLeaving = false,
  newsCategoryTabs,
  onNewsCategoryChange,
  onOpenArticle,
  onOpenPolicy,
  onTypeChange,
  showNewsCategoryTabs,
}: {
  activeNewsCategory: string;
  activeType: MyBookmarkTypeTab;
  items: MyBookmarkSummaryItem[];
  isLeaving?: boolean;
  newsCategoryTabs: string[];
  onNewsCategoryChange: (category: string) => void;
  onOpenArticle: OpenArticleDetail;
  onOpenPolicy: (policy: PolicyItem) => void;
  onTypeChange: (type: MyBookmarkTypeTab) => void;
  showNewsCategoryTabs: boolean;
}) {
  const newsItems = items.filter(
    (item): item is MyBookmarkNewsSummaryItem => item.bookmarkType === "news",
  );
  const policyItems = items.filter(
    (item): item is MyBookmarkPolicySummaryItem =>
      item.bookmarkType === "policy",
  );
  const visibleBookmarkItems: MyBookmarkSummaryItem[] =
    activeType === "news"
      ? showNewsCategoryTabs
        ? getVisibleNewsItems(newsItems, activeNewsCategory)
        : newsItems
      : policyItems;

  return (
    <div
      className={`container_myBookmarkPage ${getEnterFromRightMotionClassName(isLeaving)}`}
    >
      <h2 className="text_mySectionTitle">북마크</h2>
      <div className="wrapper_myTabbedDetailContent">
        <div className="wrapper_myBookmarkTabStack">
          <PillTabMenu
            ariaLabel="북마크 유형"
            className="tab_myCategoryMenu"
            items={bookmarkTypeTabs}
            onChange={onTypeChange}
            value={activeType}
          />
          {activeType === "news" && showNewsCategoryTabs ? (
            <PillTabMenu
              ariaLabel="북마크 뉴스 카테고리"
              className="tab_myCategoryMenu"
              items={newsCategoryTabs.map((category) => ({
                id: category,
                label: category,
              }))}
              onChange={onNewsCategoryChange}
              value={activeNewsCategory}
            />
          ) : null}
        </div>
        <div className="wrapper_myBookmarkList">
          {visibleBookmarkItems.length === 0 ? (
            <DataUnavailableMessage target="북마크" />
          ) : (
            <SeparatedList
              dividerClassName="divider_mySection"
              dividerPlacement="after-wrapped-item"
              getKey={(item, index) => `${item.title}-${index}`}
              items={visibleBookmarkItems}
              renderItem={(item, index) =>
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
                  <ContentSummaryButton
                    className="newsroll_policy_list_item"
                    onClick={() => onOpenPolicy(item.policy)}
                  >
                    <div className="newsroll_policy_list_tags">
                      {item.tags.map((tag, tagIndex) => (
                        <ChipLabel
                          kind={
                            tagIndex === item.tags.length - 1
                              ? "policyAccent"
                              : "policy"
                          }
                          key={`${item.title}-${tag}`}
                        >
                          {tag}
                        </ChipLabel>
                      ))}
                    </div>
                    <div className="wrapper_policyItemContent">
                      <h2>{item.title}</h2>
                      <p className="text_infoBody text_lineClamp2">
                        {item.summary}
                      </p>
                    </div>
                  </ContentSummaryButton>
                )
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
