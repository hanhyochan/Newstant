import { PillTabMenu } from "@/design-system/components";
import { getEnterFromRightMotionClassName } from "@/design-system/templates";
import {
  AllNewsHeadlineItem,
  ArticleGuideOptionButton,
  binaryGuideOptions,
  type AllNewsArticlePreview,
  type HomeArticle,
  type OpenArticleDetail,
} from "@/features/news/NewsViews";
import { DataUnavailableMessage } from "@/features/shared/DataUnavailableMessage";
import { SeparatedList } from "@/features/shared/SeparatedList";

export type MyVoteSummaryItem = {
  article: HomeArticle;
  category: string;
  headline: AllNewsArticlePreview & { category: string };
  isBinary: boolean;
  percent: number;
  pollTitle: string;
  selectedOption: string;
  title: string;
};

function isAllCategory(category: string) {
  return category === "전체";
}

function getVisibleItems(items: MyVoteSummaryItem[], activeCategory: string) {
  return isAllCategory(activeCategory)
    ? items
    : items.filter((item) => item.category === activeCategory);
}

export function MyVoteDetailPage({
  activeCategory,
  items,
  isLeaving = false,
  onCategoryChange,
  onOpenArticle,
  showTabs,
  tabs,
}: {
  activeCategory: string;
  items: MyVoteSummaryItem[];
  isLeaving?: boolean;
  onCategoryChange: (category: string) => void;
  onOpenArticle: OpenArticleDetail;
  showTabs: boolean;
  tabs: string[];
}) {
  const visibleVoteItems = getVisibleItems(items, activeCategory);

  return (
    <div
      className={`container_myVotePage ${getEnterFromRightMotionClassName(isLeaving)}`}
    >
      <h2 className="text_mySectionTitle">투표</h2>
      <div className="wrapper_myTabbedDetailContent">
      {showTabs ? (
        <PillTabMenu
          ariaLabel="내가 참여한 투표 카테고리"
          className="tab_myCategoryMenu"
          items={tabs.map((category) => ({
            id: category,
            label: category,
          }))}
          onChange={onCategoryChange}
          value={activeCategory}
        />
      ) : null}
      <div className="wrapper_myVoteList">
        {visibleVoteItems.length === 0 ? (
          <DataUnavailableMessage target="투표" />
        ) : (
          <SeparatedList
            dividerClassName="divider_mySection"
            getKey={(item, index) => `${item.title}-${index}`}
            items={visibleVoteItems}
            renderItem={(item) => (
              <article className="wrapper_myVoteItem">
                <AllNewsHeadlineItem
                  item={item.headline}
                  onClick={() =>
                    onOpenArticle(item.article, { scrollTarget: "poll" })
                  }
                />
                <strong className="text_myVoteQuestion">{item.pollTitle}</strong>
                <ArticleGuideOptionButton
                  binaryTone={
                    item.isBinary
                      ? item.selectedOption === binaryGuideOptions[0]
                        ? "yes"
                        : "no"
                      : undefined
                  }
                  iconSrc={
                    item.isBinary
                      ? item.selectedOption === binaryGuideOptions[0]
                        ? "/icons/icon_yes.svg"
                        : "/icons/icon_no.svg"
                      : undefined
                  }
                  label={item.selectedOption}
                  onClick={() =>
                    onOpenArticle(item.article, { scrollTarget: "poll" })
                  }
                  percent={item.percent}
                  showResult
                  state="active"
                  variant={item.isBinary ? "binary" : "stacked"}
                />
              </article>
            )}
          />
        )}
      </div>
      </div>
    </div>
  );
}
