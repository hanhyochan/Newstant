import { useEffect, useMemo, useRef, useState } from "react";

import {
  getEnterFromRightMotionClassName,
  useSwipeTabNavigation,
} from "@/design-system/templates";
import {
  PrimaryButton,
  PrimaryButtonGroup,
  CheckInput,
  PillTabMenu,
  NewsListCardButton as AllNewsRelayItem,
} from "@/design-system/components";
import {
  homeArticle,
  homeArticles,
  type HomeArticle,
  type OpenArticleDetail,
} from "@/features/news/model";
import {
  BottomFixedActionBar,
  bottomFixedActionBarExitDurationMs,
} from "@/features/shared/BottomFixedActionBar";
import { DataUnavailableMessage } from "@/features/shared/DataUnavailableMessage";
import { SeparatedList } from "@/features/shared/SeparatedList";

export type MyRecentSummaryItem = {
  article: HomeArticle;
  category: string;
  dateTime: string;
  image: string;
  time: string;
  title: string;
  viewId: string;
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

function isAllCategory(category: string) {
  return category === "전체";
}

function getVisibleItems(
  items: MyRecentSummaryItem[],
  activeCategory: string,
) {
  return isAllCategory(activeCategory)
    ? items
    : items.filter((item) => item.category === activeCategory);
}

export function MyRecentDetailPage({
  activeCategory,
  items,
  isLeaving = false,
  onCategoryChange,
  onDeleteRecentViews,
  onOpenArticle,
  showTabs,
  tabs,
}: {
  activeCategory: string;
  items: MyRecentSummaryItem[];
  isLeaving?: boolean;
  onCategoryChange: (category: string) => void;
  onDeleteRecentViews: (viewIds: string[]) => Promise<void> | void;
  onOpenArticle: OpenArticleDetail;
  showTabs: boolean;
  tabs: string[];
}) {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteBarLeaving, setIsDeleteBarLeaving] = useState(false);
  const [selectedViewIds, setSelectedViewIds] = useState<Set<string>>(
    () => new Set(),
  );
  const closeSelectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const visibleRecentItems = useMemo(
    () => (showTabs ? getVisibleItems(items, activeCategory) : items),
    [activeCategory, items, showTabs],
  );
  const {
    swipeMotionClassName: recentTabSwipeMotionClassName,
    ...recentTabSwipeHandlers
  } = useSwipeTabNavigation({
    disabled: !showTabs,
    items: tabs.map((category) => ({ id: category })),
    onChange: onCategoryChange,
    value: activeCategory,
  });
  const selectedCount = selectedViewIds.size;
  const selectableViewIds = useMemo(
    () => visibleRecentItems.map((item) => item.viewId),
    [visibleRecentItems],
  );
  const isAllSelected =
    selectableViewIds.length > 0 &&
    selectableViewIds.every((viewId) => selectedViewIds.has(viewId));
  const selectAllControl = (
    <CheckInput
      checked={isAllSelected}
      role="selectAll"
      size="lg"
      disabled={selectableViewIds.length === 0 || isDeleting}
      label="전체 선택"
      onChange={toggleAllSelection}
    />
  );

  useEffect(
    () => () => {
      if (closeSelectionTimeoutRef.current) {
        clearTimeout(closeSelectionTimeoutRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (isDeleteBarLeaving) {
      return;
    }

    setSelectedViewIds((current) => {
      const selectableIdSet = new Set(selectableViewIds);
      const next = new Set(
        Array.from(current).filter((viewId) => selectableIdSet.has(viewId)),
      );

      return next.size === current.size ? current : next;
    });
  }, [isDeleteBarLeaving, selectableViewIds]);

  function toggleAllSelection() {
    if (closeSelectionTimeoutRef.current) {
      clearTimeout(closeSelectionTimeoutRef.current);
      closeSelectionTimeoutRef.current = null;
    }

    setIsDeleteBarLeaving(false);
    setIsDeleting(false);
    setIsSelectionMode(true);
    setSelectedViewIds(isAllSelected ? new Set() : new Set(selectableViewIds));
  }

  function toggleItemSelection(viewId: string) {
    if (closeSelectionTimeoutRef.current) {
      clearTimeout(closeSelectionTimeoutRef.current);
      closeSelectionTimeoutRef.current = null;
    }

    setIsDeleteBarLeaving(false);
    setIsDeleting(false);
    setIsSelectionMode(true);
    setSelectedViewIds((current) => {
      const next = new Set(current);

      if (next.has(viewId)) {
        next.delete(viewId);
      } else {
        next.add(viewId);
      }

      return next;
    });
  }

  async function deleteSelectedItems() {
    const viewIds = Array.from(selectedViewIds);

    if (viewIds.length === 0 || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      await onDeleteRecentViews(viewIds);
      setIsDeleteBarLeaving(true);

      if (closeSelectionTimeoutRef.current) {
        clearTimeout(closeSelectionTimeoutRef.current);
      }

      closeSelectionTimeoutRef.current = setTimeout(() => {
        setSelectedViewIds(new Set());
        setIsSelectionMode(false);
        setIsDeleteBarLeaving(false);
        setIsDeleting(false);
        closeSelectionTimeoutRef.current = null;
      }, bottomFixedActionBarExitDurationMs);
    } catch (error) {
      setIsDeleting(false);
      throw error;
    }
  }

  return (
    <div
      className={`container_myBookmarkPage ${getEnterFromRightMotionClassName(isLeaving)}`}
    >
      <h2 className="text_mySectionTitle">최근 본 뉴스</h2>
      <div
        className="wrapper_myTabbedDetailContent wrapper_panelContent"
        {...recentTabSwipeHandlers}
      >
        {showTabs ? (
          <>
            <PillTabMenu
              ariaLabel="최근 본 뉴스 카테고리"
              className="tab_myCategoryMenu wrapper_tabScroller"
              items={tabs.map((category) => ({
                id: category,
                label: category,
              }))}
              onChange={onCategoryChange}
              value={activeCategory}
            />
            <div className="wrapper_myRecentSelectAllControls">
              {selectAllControl}
            </div>
          </>
        ) : (
          <div className="wrapper_myRecentSelectAllControls">
            {selectAllControl}
          </div>
        )}
        <div
          className={`wrapper_allTabPanelBody wrapper_panelContent ${recentTabSwipeMotionClassName}`.trim()}
        >
          {visibleRecentItems.length === 0 ? (
            <DataUnavailableMessage target="최근 본 뉴스" />
          ) : (
            <SeparatedList
              dividerClassName="all_itemDivider"
              getKey={(item, index) => `${item.viewId}-${item.title}-${index}`}
              items={visibleRecentItems}
              renderItem={(item, index) => {
                const isSelected = selectedViewIds.has(item.viewId);

                return (
                  <div
                    className="wrapper_myRecentSelectableItem"
                    data-selection-mode={isSelectionMode ? "true" : "false"}
                  >
                    {isSelectionMode ? (
                      <CheckInput
                        variant="withoutText"
                        ariaLabel={`${item.title} 선택`}
                        checked={isSelected}
                        role="selectionItem"
                        onChange={() => toggleItemSelection(item.viewId)}
                        size="md"
                      />
                    ) : null}
                    <AllNewsRelayItem
                      featured={index === 0 || index === 5}
                      item={item}
                      onClick={() =>
                        onOpenArticle(createMyRecentArticle(item, index))
                      }
                    />
                  </div>
                );
              }}
            />
          )}
        </div>
      </div>
      {selectedCount > 0 ? (
        <BottomFixedActionBar
          ariaLabel="최근 본 뉴스 선택 삭제"
          className="container_myRecentDeleteFixed"
          isLeaving={isDeleteBarLeaving}
        >
          <PrimaryButtonGroup>
        <PrimaryButton
            className="btn_myRecentDelete"
            disabled={isDeleting}
            onClick={deleteSelectedItems}


            tone="danger"
            type="button"

          >
            삭제하기
          </PrimaryButton>
      </PrimaryButtonGroup>
        </BottomFixedActionBar>
      ) : null}
    </div>
  );
}
