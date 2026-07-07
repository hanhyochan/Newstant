import { useMemo } from "react";

import type { MyBookmarkSummaryItem } from "@/features/my-page/detail/MyBookmarkDetailPage";
import type { MyCommentSummaryItem } from "@/features/my-page/detail/MyCommentDetailPage";
import type { MyRecentSummaryItem } from "@/features/my-page/detail/MyRecentDetailPage";
import type { MyVoteSummaryItem } from "@/features/my-page/detail/MyVoteDetailPage";
import {
  getMyPolicyAgeTabs,
  getMySummaryCategoryTabs,
  hasMultipleMyCommentKinds,
  myCommentTabs,
  mySummaryItems,
  shouldShowMyCategoryTabs,
  type MySummaryView,
} from "@/features/my-page/model";

type UseMyPageDynamicTabsOptions = {
  bookmarkCount: number;
  bookmarkItems: MyBookmarkSummaryItem[];
  commentItems: MyCommentSummaryItem[];
  recentItems: MyRecentSummaryItem[];
  voteCount: number;
  voteItems: MyVoteSummaryItem[];
};

export function useMyPageDynamicTabs({
  bookmarkCount,
  bookmarkItems,
  commentItems,
  recentItems,
  voteCount,
  voteItems,
}: UseMyPageDynamicTabsOptions) {
  const commentCategoryTabs = useMemo(() => myCommentTabs, []);
  const bookmarkNewsCategoryTabs = useMemo(
    () =>
      getMySummaryCategoryTabs(
        bookmarkItems.filter((item) => item.bookmarkType === "news"),
      ),
    [bookmarkItems],
  );
  const bookmarkPolicyAgeTabs = useMemo(
    () =>
      getMyPolicyAgeTabs(
        bookmarkItems.filter((item) => item.bookmarkType === "policy"),
      ),
    [bookmarkItems],
  );
  const recentCategoryTabs = useMemo(
    () => getMySummaryCategoryTabs(recentItems),
    [recentItems],
  );
  const voteCategoryTabs = useMemo(
    () => getMySummaryCategoryTabs(voteItems),
    [voteItems],
  );
  const showBookmarkNewsCategoryTabs = useMemo(
    () =>
      bookmarkItems.some((item) => item.bookmarkType === "news") &&
      bookmarkNewsCategoryTabs.length > 1,
    [bookmarkItems, bookmarkNewsCategoryTabs.length],
  );
  const showBookmarkPolicyAgeTabs = useMemo(
    () =>
      bookmarkItems.some((item) => item.bookmarkType === "policy") &&
      bookmarkPolicyAgeTabs.length > 1,
    [bookmarkItems, bookmarkPolicyAgeTabs.length],
  );
  const showRecentCategoryTabs = useMemo(
    () => shouldShowMyCategoryTabs(recentItems),
    [recentItems],
  );
  const showVoteCategoryTabs = useMemo(
    () => shouldShowMyCategoryTabs(voteItems),
    [voteItems],
  );
  const showCommentKindTabs = useMemo(
    () => hasMultipleMyCommentKinds(commentItems),
    [commentItems],
  );
  const activityCounts = useMemo(
    () =>
      Object.fromEntries(
        mySummaryItems.map((item) => [
          item.value,
          item.value === "comment"
            ? commentItems.length
            : item.value === "bookmark"
              ? bookmarkCount
              : item.value === "vote"
                ? voteCount
                : 0,
        ]),
      ) as Record<MySummaryView, number>,
    [bookmarkCount, commentItems.length, voteCount],
  );

  return {
    activityCounts,
    bookmarkNewsCategoryTabs,
    bookmarkPolicyAgeTabs,
    commentCategoryTabs,
    recentCategoryTabs,
    showBookmarkNewsCategoryTabs,
    showBookmarkPolicyAgeTabs,
    showCommentKindTabs,
    showRecentCategoryTabs,
    showVoteCategoryTabs,
    voteCategoryTabs,
  };
}
