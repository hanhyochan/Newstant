import { useState } from "react";

import type { ArticleDetailOpenOptions, HomeArticle, PolicyItem } from "@/features/news/model";
import type { MyProfileSettingItemId } from "@/features/my-page/detail/MyProfileSettingDetailPage";
import type { MyPageDetailView } from "@/features/my-page/model";

export function useMyPageNavigation() {
  const [activeDetailView, setActiveDetailView] =
    useState<MyPageDetailView>(null);
  const [myArticleDetail, setMyArticleDetail] = useState<{
    article: HomeArticle;
    commentId?: string;
    replyToCommentId?: string;
    scrollTarget?: ArticleDetailOpenOptions["scrollTarget"];
  } | null>(null);
  const [myPolicyDetail, setMyPolicyDetail] = useState<PolicyItem | null>(null);
  const [activeProfileSettingItemId, setActiveProfileSettingItemId] =
    useState<MyProfileSettingItemId | null>(null);

  const isRecentOpen = activeDetailView === "recent";
  const isCustomNewsSettingsOpen = activeDetailView === "customNewsSettings";
  const isNewsViewTimeOpen = activeDetailView === "newsViewTime";
  const isProfileSettingsOpen = activeDetailView === "profileSettings";
  const isBookmarkOpen = activeDetailView === "bookmark";
  const isVoteOpen = activeDetailView === "vote";
  const isCommentOpen = activeDetailView === "comment";
  const isMyArticleDetailOpen = myArticleDetail !== null;
  const isMyPolicyDetailOpen = myPolicyDetail !== null;
  const isMyNestedDetailOpen = isMyArticleDetailOpen || isMyPolicyDetailOpen;

  return {
    activeDetailView,
    activeProfileSettingItemId,
    isBookmarkOpen,
    isCommentOpen,
    isCustomNewsSettingsOpen,
    isMyArticleDetailOpen,
    isMyNestedDetailOpen,
    isMyPolicyDetailOpen,
    isNewsViewTimeOpen,
    isProfileSettingsOpen,
    isRecentOpen,
    isVoteOpen,
    myArticleDetail,
    myPolicyDetail,
    setActiveDetailView,
    setActiveProfileSettingItemId,
    setMyArticleDetail,
    setMyPolicyDetail,
  };
}