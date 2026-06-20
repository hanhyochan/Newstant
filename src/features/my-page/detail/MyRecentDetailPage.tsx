import { useEffect, useMemo, useRef, useState } from "react";

import { getEnterFromRightMotionClassName } from "@/design-system/templates";
import {
  Button,
  NewsRollCheckBox,
  NewsRollSmallCheckField,
} from "@/design-system/components";
import {
  AllNewsRelayItem,
  homeArticle,
  homeArticles,
  type HomeArticle,
  type OpenArticleDetail,
} from "@/features/news/NewsViews";
import {
  BottomFixedActionBar,
  bottomFixedActionBarExitDurationMs,
} from "@/features/shared/BottomFixedActionBar";
import { DataUnavailableMessage } from "@/features/shared/DataUnavailableMessage";
import { SeparatedList } from "@/features/shared/SeparatedList";

export type MyRecentSummaryItem = {
  article: HomeArticle;
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

export function MyRecentDetailPage({
  items,
  isLeaving = false,
  onDeleteRecentViews,
  onOpenArticle,
}: {
  items: MyRecentSummaryItem[];
  isLeaving?: boolean;
  onDeleteRecentViews: (viewIds: string[]) => Promise<void> | void;
  onOpenArticle: OpenArticleDetail;
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
  const selectedCount = selectedViewIds.size;
  const selectableViewIds = useMemo(() => items.map((item) => item.viewId), [items]);
  const isAllSelected =
    selectableViewIds.length > 0 &&
    selectableViewIds.every((viewId) => selectedViewIds.has(viewId));

  useEffect(
    () => () => {
      if (closeSelectionTimeoutRef.current) {
        clearTimeout(closeSelectionTimeoutRef.current);
      }
    },
    [],
  );

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
      <NewsRollSmallCheckField
        checked={isAllSelected}
        className="btn_myRecentSelectAll"
        disabled={selectableViewIds.length === 0 || isDeleting}
        label="전체 선택"
        onClick={toggleAllSelection}
      />
      {items.length === 0 ? (
        <DataUnavailableMessage target="최근 본 뉴스" />
      ) : (
        <>
          <SeparatedList
            dividerClassName="newsroll_all_itemDivider"
            getKey={(item, index) => `${item.viewId}-${item.title}-${index}`}
            items={items}
            renderItem={(item, index) => {
              const isSelected = selectedViewIds.has(item.viewId);

              return (
                <div
                  className="wrapper_myRecentSelectableItem"
                  data-selection-mode={isSelectionMode ? "true" : "false"}
                >
                  {isSelectionMode ? (
                    <button
                      aria-label={`${item.title} 선택`}
                      aria-pressed={isSelected}
                      className="btn_myRecentItemCheck"
                      onClick={() => toggleItemSelection(item.viewId)}
                      type="button"
                    >
                      <NewsRollCheckBox
                        checked={isSelected}
                        className="box_myRecentItemCheck"
                        size="small"
                      />
                    </button>
                  ) : null}
                  <AllNewsRelayItem
                    featured={index === 0 || index === 5}
                    item={item}
                    onClick={() => onOpenArticle(createMyRecentArticle(item, index))}
                  />
                </div>
              );
            }}
          />
        </>
      )}
      {selectedCount > 0 ? (
        <BottomFixedActionBar
          ariaLabel="최근 본 뉴스 선택 삭제"
          className="container_myRecentDeleteFixed"
          isLeaving={isDeleteBarLeaving}
        >
          <Button
            className="btn_myRecentDelete"
            disabled={isDeleting}
            onClick={deleteSelectedItems}
            radius="rounded"
            size="large"
            tone="danger"
            type="button"
            variant="filled"
          >
            삭제하기
          </Button>
        </BottomFixedActionBar>
      ) : null}
    </div>
  );
}
