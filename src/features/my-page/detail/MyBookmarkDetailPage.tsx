import {
  ChipLabel,
  ContentSummaryButton,
  PillTabMenu,
  NewsListCardButton as AllNewsRelayItem,
} from "@/design-system/components";
import {
  getEnterFromRightMotionClassName,
  useSwipeTabNavigation,
} from "@/design-system/templates";
import {
  createAllNewsArticle,
  type AllNewsArticlePreview,
} from "@/features/news/all-news/all-news-model";
import type { OpenArticleDetail, PolicyItem } from "@/features/news/model";
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
  policyAgeLabels: string[];
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

function getVisiblePolicyItems(
  items: MyBookmarkPolicySummaryItem[],
  activeAgeLabel: string,
) {
  return isAllCategory(activeAgeLabel)
    ? items
    : items.filter((item) => item.policyAgeLabels.includes(activeAgeLabel));
}

export function MyBookmarkDetailPage({
  activeNewsCategory,
  activePolicyAgeLabel,
  activeType,
  items,
  isLeaving = false,
  newsCategoryTabs,
  onNewsCategoryChange,
  onOpenArticle,
  onOpenPolicy,
  onPolicyAgeChange,
  onTypeChange,
  policyAgeTabs,
  showNewsCategoryTabs,
  showPolicyAgeTabs,
}: {
  activeNewsCategory: string;
  activePolicyAgeLabel: string;
  activeType: MyBookmarkTypeTab;
  items: MyBookmarkSummaryItem[];
  isLeaving?: boolean;
  newsCategoryTabs: string[];
  onNewsCategoryChange: (category: string) => void;
  onOpenArticle: OpenArticleDetail;
  onOpenPolicy: (policy: PolicyItem) => void;
  onPolicyAgeChange: (ageLabel: string) => void;
  onTypeChange: (type: MyBookmarkTypeTab) => void;
  policyAgeTabs: string[];
  showNewsCategoryTabs: boolean;
  showPolicyAgeTabs: boolean;
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
      : showPolicyAgeTabs
        ? getVisiblePolicyItems(policyItems, activePolicyAgeLabel)
        : policyItems;
  const {
    swipeMotionClassName: bookmarkTypeSwipeMotionClassName,
    ...bookmarkTypeSwipeHandlers
  } = useSwipeTabNavigation({
    items: bookmarkTypeTabs,
    onChange: onTypeChange,
    value: activeType,
  });

  return (
    <div
      className={`container_myBookmarkPage ${getEnterFromRightMotionClassName(isLeaving)}`}
    >
      <h2 className="text_mySectionTitle">북마크</h2>
      <div
        className="wrapper_myTabbedDetailContent wrapper_panelContent u_gap24 all_panelContentFlush"
        {...bookmarkTypeSwipeHandlers}
      >
        <div className="all_tabSticky wrapper_myBookmarkTabStack wrapper_stickyHeader wrapper_stickyHeader_style all_category_tabSticky">
          <PillTabMenu
            ariaLabel="북마크 유형"
            className="all_category_tabs wrapper_tabScroller"
            items={bookmarkTypeTabs}
            onChange={onTypeChange}
            value={activeType}
          />
          {activeType === "news" && showNewsCategoryTabs ? (
            <PillTabMenu
              ariaLabel="북마크 뉴스 카테고리"
              className="all_category_tabs wrapper_tabScroller"
              items={newsCategoryTabs.map((category) => ({
                id: category,
                label: category,
              }))}
              onChange={onNewsCategoryChange}
              value={activeNewsCategory}
            />
          ) : null}
          {activeType === "policy" && showPolicyAgeTabs ? (
            <PillTabMenu
              ariaLabel="북마크 국가정책 연령층"
              className="all_category_tabs wrapper_tabScroller"
              items={policyAgeTabs.map((ageLabel) => ({
                id: ageLabel,
                label: ageLabel,
              }))}
              onChange={onPolicyAgeChange}
              value={activePolicyAgeLabel}
            />
          ) : null}
        </div>
        <div
          className={`wrapper_allTabPanelBody wrapper_myBookmarkList wrapper_scrollList ${bookmarkTypeSwipeMotionClassName}`.trim()}
        >
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
                    className="btn_contentListItem"
                    onClick={() => onOpenPolicy(item.policy)}
                  >
                    <div className="wrapper_contentTagGroup u_gap8">
                      {item.tags.map((tag) => (
                        <ChipLabel key={`${item.title}-${tag}`}>
                          {tag}
                        </ChipLabel>
                      ))}
                    </div>
                    <div className="wrapper_contentMeta u_gap8">
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
