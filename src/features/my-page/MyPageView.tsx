"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  bookmarkApi,
  commentApi,
  inquiryApi,
  newsApi,
  notificationApi,
  pollApi,
  settingsApi,
  userApi,
  userContentActionApi,
  welfareApi,
  type Inquiry,
  type UpdateUserInput,
  type User,
  type UserContentAction,
} from "@/shared/newsroll/api";
import {
  currentUserId,
  getCurrentUserSnapshot,
  setCurrentUserSession,
} from "@/shared/newsroll/auth/current-user";
import { fixedDockedPanelProps } from "@/shared/newsroll/my-info-panel-behavior";
import {
  Divider,
  IconButton,
  IconTextButton,
  NewsBlockCardButton,
  NewsBlockCardSkeleton,
  TextButton,
} from "@/design-system/components";
import {
  NewsRollCommonLayout,
  NewsRollDetailBackButton,
  NewsRollDockedControls,
  NewsRollHeaderTop,
  NewsRollPagePanel,
  newsrollHomeDockedScrollSelectors as homeDockedScrollSelectors,
  newsrollNewsFeedDetailSelector,
  newsrollPagePanelContentSelector as pagePanelContentSelector,
  newsrollPagePanelDockedGap as pagePanelDockedGap,
  newsrollPagePanelInitialGap as pagePanelInitialGap,
  newsrollPagePanelInitialTop as pagePanelInitialTop,
  useDetailScrollRestore,
  useEnterFromRightExitMotion,
} from "@/design-system/templates";
import { getCommentItemFromApi } from "@/features/comments/utils/comment-data";
import { ConfirmDialog } from "@/features/shared/ConfirmDialog";
import { MySettingRow } from "@/features/my-page/components/MySettingRow";
import {
  MyBookmarkDetailPage,
  type MyBookmarkNewsSummaryItem,
  type MyBookmarkPolicySummaryItem,
  type MyBookmarkSummaryItem,
  type MyBookmarkTypeTab,
} from "@/features/my-page/detail/MyBookmarkDetailPage";
import {
  MyCommentDetailPage,
  type MyCommentKind,
  type MyCommentSummaryItem,
} from "@/features/my-page/detail/MyCommentDetailPage";
import { MyCustomNewsSettingsPage } from "@/features/my-page/detail/MyCustomNewsSettingsPage";
import { MyNewsViewTimePage } from "@/features/my-page/detail/MyNewsViewTimePage";
import { MyProfileSettingsPage } from "@/features/my-page/detail/MyProfileSettingsPage";
import { MyProfileSettingDetailPage } from "@/features/my-page/detail/MyProfileSettingDetailPage";
import {
  MyRecentDetailPage,
  createMyRecentArticle,
  type MyRecentSummaryItem,
} from "@/features/my-page/detail/MyRecentDetailPage";
import {
  MyVoteDetailPage,
  type MyVoteSummaryItem,
} from "@/features/my-page/detail/MyVoteDetailPage";
import {
  getAgeGroupPreferenceId,
  getCategorySettingsFromPreference,
  getInitialCategorySettings,
  getMyCategoryOptionId,
  getMyCategoryTabItems,
  getMyProfileSettingItemId,
  getMySummaryCategoryTabs,
  getNewsCategoryPreferenceIds,
  getNewsViewTimesFromApi,
  getNotificationSettingsFromApi,
  getPolicyBookmarkItem,
  getPressPreferenceIds,
  myBookmarkTabs,
  myCategoryGroups,
  myNewsViewTimeSections,
  myNotificationLabels,
  myOrderedProfileSettingSections,
  myPolicyAgeLabelById,
  myRecentPreviewLimit,
  mySummaryAllTabLabel,
  mySummaryItems,
  type MySummaryView,
} from "@/features/my-page/model";
import { buildMyActivitySummary } from "@/features/my-page/utils/my-activity-summary";
import { useMyPageNavigation } from "@/features/my-page/hooks/use-my-page-navigation";
import { useMyPageDynamicTabs } from "@/features/my-page/hooks/use-my-page-dynamic-tabs";
import { PolicyDetailContent } from "@/features/policy/PolicyDetailContent";
import { DockedAlarmButton, NewsToolbar } from "@/features/shell/NewsRollToolbar";

import { ArticleDetailContent } from "@/features/news/article/HomeReelCard";
import { getAllNewsPreviewFromArticle } from "@/features/news/all-news/all-news-model";
import {
  binaryGuideOptions,
  guideOptions,
} from "@/features/news/model";
import {
  formatNewsDate,
  getHomeArticleFromNews,
  type BlockedKeywordSetting,
  type OpenArticleDetail,
  type PolicyItem,
} from "@/features/news/model";
import { MoreActionButton } from "@/features/shared/MoreActionButton";
export function MyPageView({
  blockedKeywordSettings,
  isDarkMode,
  isTextLarge,
  onAddBlockedKeyword,
  onDarkModeChange,
  onDeleteBlockedKeyword,
  onToggleBlockedKeyword,
  onOpenBreakingNews,
  onOpenNotifications,
  onOpenSearch,
  onLogout,
  onToggleTextSize,
}: {
  blockedKeywordSettings: BlockedKeywordSetting[];
  isDarkMode: boolean;
  isTextLarge: boolean;
  onAddBlockedKeyword: (keyword: string) => void;
  onDarkModeChange: (isDarkMode: boolean) => void;
  onDeleteBlockedKeyword: (keyword: string) => void;
  onToggleBlockedKeyword: (keyword: string) => void;
  onOpenBreakingNews: () => void;
  onOpenNotifications: () => void;
  onOpenSearch: () => void;
  onLogout: () => void;
  onToggleTextSize: () => void;
}) {
  const currentUser = getCurrentUserSnapshot();
  const {
    activeDetailView,
    activeProfileSettingItemId,
    isBookmarkOpen,
    isCommentOpen,
    isCustomNewsSettingsOpen,
    isMyArticleDetailOpen,
    isMyNestedDetailOpen,
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
  } = useMyPageNavigation();
  const [activeRecentCategory, setActiveRecentCategory] = useState(
    () => mySummaryAllTabLabel,
  );
  const [activeVoteCategory, setActiveVoteCategory] = useState(
    () => mySummaryAllTabLabel,
  );
  const [activeBookmarkType, setActiveBookmarkType] =
    useState<MyBookmarkTypeTab>("news");
  const [activeBookmarkNewsCategory, setActiveBookmarkNewsCategory] = useState(
    () => mySummaryAllTabLabel,
  );
  const [activeBookmarkPolicyAgeLabel, setActiveBookmarkPolicyAgeLabel] =
    useState(() => mySummaryAllTabLabel);
  const [activeCommentCategory, setActiveCommentCategory] = useState<MyCommentKind>(
    () => "all",
  );
  const [myDynamicCommentItems, setMyDynamicCommentItems] = useState<
    MyCommentSummaryItem[]
  >([]);
  const [myDynamicBookmarkItems, setMyDynamicBookmarkItems] = useState<
    MyBookmarkSummaryItem[]
  >([]);
  const [myDynamicVoteItems, setMyDynamicVoteItems] = useState<
    MyVoteSummaryItem[]
  >([]);
  const [myDynamicRecentItems, setMyDynamicRecentItems] = useState<
    MyRecentSummaryItem[]
  >([]);
  const [myBookmarkCount, setMyBookmarkCount] = useState(0);
  const [myVoteCount, setMyVoteCount] = useState(0);
  const [selectedCategorySettings, setSelectedCategorySettings] = useState(
    getInitialCategorySettings,
  );
  const [notificationSettings, setNotificationSettings] = useState<
    Record<string, boolean>
  >(() =>
    Object.fromEntries(myNotificationLabels.map((label) => [label, true])) as Record<
      string,
      boolean
    >,
  );
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [profileUsers, setProfileUsers] = useState<User[]>([]);
  const [myInquiryItems, setMyInquiryItems] = useState<Inquiry[]>([]);
  const [myContentActionItems, setMyContentActionItems] = useState<
    UserContentAction[]
  >([]);
  const [selectedNewsViewTimes, setSelectedNewsViewTimes] = useState(
    () => new Set(["07:00", "21:00"]),
  );
  const userPreferenceIdRef = useRef<string | null>(null);
  const notificationSettingsIdRef = useRef<string | null>(null);
  const userNewsViewTimeIdRef = useRef<string | null>(null);
  const [isBlockedKeywordDialogOpen, setIsBlockedKeywordDialogOpen] =
    useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [blockedKeywordInputValue, setBlockedKeywordInputValue] = useState("");
  const myPanelContentRef = useRef<HTMLDivElement>(null);
  const {
    activityCounts: myActivityCounts,
    bookmarkNewsCategoryTabs: dynamicBookmarkNewsCategoryTabs,
    bookmarkPolicyAgeTabs: dynamicBookmarkPolicyAgeTabs,
    commentCategoryTabs: dynamicCommentCategoryTabs,
    recentCategoryTabs: dynamicRecentCategoryTabs,
    showBookmarkNewsCategoryTabs: shouldShowBookmarkNewsCategoryTabs,
    showBookmarkPolicyAgeTabs: shouldShowBookmarkPolicyAgeTabs,
    showCommentKindTabs: shouldShowCommentKindTabs,
    showRecentCategoryTabs: shouldShowRecentCategoryTabs,
    showVoteCategoryTabs: shouldShowVoteCategoryTabs,
    voteCategoryTabs: dynamicVoteCategoryTabs,
  } = useMyPageDynamicTabs({
    bookmarkCount: myBookmarkCount,
    bookmarkItems: myDynamicBookmarkItems,
    commentItems: myDynamicCommentItems,
    recentItems: myDynamicRecentItems,
    voteCount: myVoteCount,
    voteItems: myDynamicVoteItems,
  });
  const activeSummary = isBookmarkOpen
    ? "bookmark"
    : isVoteOpen
      ? "vote"
      : isCommentOpen
        ? "comment"
        : null;
  const isMyDetailOpen = activeDetailView !== null || isMyNestedDetailOpen;
  const myDetailScrollRestore = useDetailScrollRestore({
    isDetailOpen: isMyDetailOpen,
    resetKey: activeProfileSettingItemId
      ? `${activeDetailView}:${activeProfileSettingItemId}`
      : activeDetailView,
    scrollerRef: myPanelContentRef,
  });
  const myArticleDetailScrollRestore = useDetailScrollRestore({
    isDetailOpen: isMyNestedDetailOpen,
    resetKey:
      myArticleDetail?.article.id ??
      myArticleDetail?.article.title ??
      myPolicyDetail?.id ??
      myPolicyDetail?.title,
    scrollerRef: myPanelContentRef,
  });
  const closeMyArticleDetailImmediately = useCallback(() => {
    myArticleDetailScrollRestore.requestRestore();
    setMyArticleDetail(null);
    setMyPolicyDetail(null);
  }, [myArticleDetailScrollRestore]);
  const closeActiveDetailViewImmediately = useCallback(() => {
    myDetailScrollRestore.requestRestore();
    setMyArticleDetail(null);
    setMyPolicyDetail(null);
    setActiveProfileSettingItemId(null);
    setActiveDetailView(null);
  }, [myDetailScrollRestore]);
  const deleteRecentViews = useCallback(async (viewIds: string[]) => {
    const targetViewIds = new Set(viewIds);

    if (targetViewIds.size === 0) {
      return;
    }

    await Promise.allSettled(
      Array.from(targetViewIds).map((viewId) =>
        newsApi.deleteRecentNewsView(viewId),
      ),
    );
    setMyDynamicRecentItems((current) =>
      current.filter((item) => !targetViewIds.has(item.viewId)),
    );
  }, []);
  const myArticleDetailExitMotion = useEnterFromRightExitMotion({
    isOpen: isMyNestedDetailOpen,
    onClose: closeMyArticleDetailImmediately,
  });
  const myDetailExitMotion = useEnterFromRightExitMotion({
    isOpen: isMyDetailOpen && !isMyNestedDetailOpen,
    onClose: closeActiveDetailViewImmediately,
  });

  useEffect(() => {
    let ignore = false;

    async function loadMyActivity() {
      const [
        nextComments,
        allComments,
        allCommentReactions,
        nextNews,
        nextBookmarks,
        nextUserVotes,
        nextPolls,
        nextPollOptions,
        nextPollVotes,
        nextRecentViews,
        nextPolicies,
      ] = await Promise.all([
        commentApi.getCommentsByUserId(currentUserId),
        commentApi.getComments(),
        commentApi.getCommentReactions(),
        newsApi.getNewsList(),
        bookmarkApi.getBookmarks(currentUserId),
        pollApi.getPollVotesByUserId(currentUserId),
        pollApi.getPolls(),
        pollApi.getPollOptions(),
        pollApi.getPollVotes(),
        newsApi.getRecentNewsViews(currentUserId),
        welfareApi.getWelfarePolicyList("all"),
      ]);
      const {
        bookmarkItems: nextBookmarkItems,
        commentItems: nextItems,
        recentItems: nextRecentItems,
        voteItems: nextVoteItems,
      } = buildMyActivitySummary({
        allCommentReactions,
        allComments,
        binaryGuideOptions,
        bookmarks: nextBookmarks,
        comments: nextComments,
        formatNewsDate,
        getArticleFromNews: getHomeArticleFromNews,
        getCommentItem: getCommentItemFromApi,
        getHeadlineFromArticle: getAllNewsPreviewFromArticle,
        guideOptions,
        news: nextNews,
        polls: nextPolls,
        pollOptions: nextPollOptions,
        pollVotes: nextPollVotes,
        recentViews: nextRecentViews,
        userVotes: nextUserVotes,
      });
      const policyById = new Map(nextPolicies.map((policy) => [policy.id, policy]));
      const nextNewsBookmarkItems: MyBookmarkNewsSummaryItem[] =
        nextBookmarkItems.map((item) => ({
          ...item,
          bookmarkType: "news",
          category: item.category,
          newsCategory: item.category,
        }));
      const nextPolicyBookmarkItems: MyBookmarkPolicySummaryItem[] =
        nextBookmarks
          .filter((bookmark) => bookmark.targetType === "welfarePolicy")
          .map((bookmark): MyBookmarkPolicySummaryItem | null => {
            const policy = policyById.get(bookmark.targetId);

            if (!policy) {
              return null;
            }

            const policyItem = getPolicyBookmarkItem(policy);

            return {
              bookmarkType: "policy" as const,
              category: myBookmarkTabs[1],
              policy: policyItem,
              policyAgeLabels:
                policy.ageGroupIds?.reduce<string[]>((labels, ageGroupId) => {
                  const label =
                    myPolicyAgeLabelById[
                      ageGroupId as keyof typeof myPolicyAgeLabelById
                    ];

                  return label ? [...labels, label] : labels;
                }, []) ?? [],
              summary: policyItem.summary,
              tags: policyItem.tags,
              title: policyItem.title,
            };
          })
          .filter((item): item is MyBookmarkPolicySummaryItem => item !== null);
      const nextAllBookmarkItems = [
        ...nextNewsBookmarkItems,
        ...nextPolicyBookmarkItems,
      ];

      if (!ignore) {
        setMyDynamicCommentItems(nextItems);
        setMyDynamicBookmarkItems(nextAllBookmarkItems);
        setMyDynamicRecentItems(nextRecentItems);
        setMyDynamicVoteItems(nextVoteItems);
        setMyBookmarkCount(nextAllBookmarkItems.length);
        setMyVoteCount(nextVoteItems.length);
        setActiveCommentCategory("all");
        setActiveBookmarkType("news");
        setActiveBookmarkNewsCategory(mySummaryAllTabLabel);
        setActiveBookmarkPolicyAgeLabel(mySummaryAllTabLabel);
        setActiveRecentCategory(getMySummaryCategoryTabs(nextRecentItems)[0] ?? "");
        if (nextVoteItems.length > 0) {
          setActiveVoteCategory(getMySummaryCategoryTabs(nextVoteItems)[0] ?? "");
        }
      }
    }

    loadMyActivity().catch(() => {
      if (!ignore) {
        setMyDynamicCommentItems([]);
        setMyDynamicBookmarkItems([]);
        setMyDynamicRecentItems([]);
        setMyDynamicVoteItems([]);
        setMyBookmarkCount(0);
        setMyVoteCount(0);
        setActiveBookmarkType("news");
        setActiveBookmarkNewsCategory(mySummaryAllTabLabel);
        setActiveBookmarkPolicyAgeLabel(mySummaryAllTabLabel);
        setActiveRecentCategory(mySummaryAllTabLabel);
      }
    });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadMySettings() {
      const [
        preference,
        notifications,
        newsViewTimes,
        nextProfileUser,
        nextProfileUsers,
        nextInquiryItems,
        nextContentActionItems,
      ] = await Promise.all([
        userApi.getUserPreferences(currentUserId),
        notificationApi.getNotificationSettings(currentUserId),
        settingsApi.getUserNewsViewTimes(currentUserId),
        userApi.getCurrentUser(currentUserId).catch(() => null),
        userApi.getUsers().catch(() => []),
        inquiryApi.getInquiries(currentUserId).catch(() => []),
        userContentActionApi.getActions(currentUserId).catch(() => []),
      ]);
      const currentPreference = preference[0] ?? null;

      if (ignore) {
        return;
      }

      userPreferenceIdRef.current = currentPreference?.id ?? null;
      notificationSettingsIdRef.current = notifications?.id ?? null;
      userNewsViewTimeIdRef.current = newsViewTimes?.id ?? null;
      setSelectedCategorySettings(getCategorySettingsFromPreference(currentPreference));
      setNotificationSettings(getNotificationSettingsFromApi(notifications));
      setSelectedNewsViewTimes(getNewsViewTimesFromApi(newsViewTimes));
      setProfileUser(nextProfileUser);
      setProfileUsers(nextProfileUsers);
      setMyInquiryItems(nextInquiryItems);
      setMyContentActionItems(nextContentActionItems);
      onDarkModeChange(notifications?.darkMode ?? false);
    }

    loadMySettings().catch(() => undefined);

    return () => {
      ignore = true;
    };
  }, [onDarkModeChange]);

  const saveUserPreference = (
    nextSettings: Array<Set<string>>,
  ) => {
    const preferenceId = userPreferenceIdRef.current;

    if (!preferenceId) {
      return;
    }

    userApi
      .updateUserPreferences(preferenceId, {
        categoryIds: getNewsCategoryPreferenceIds(
          Array.from(nextSettings[0] ?? []),
        ),
        ageGroupId: getAgeGroupPreferenceId(Array.from(nextSettings[1] ?? [])[0]),
        pressIds: getPressPreferenceIds(Array.from(nextSettings[2] ?? [])),
      })
      .catch(() => undefined);
  };

  const saveNotificationSettings = (
    nextSettings: Record<(typeof myNotificationLabels)[number], boolean>,
    nextDarkMode = isDarkMode,
  ) => {
    const settingsId = notificationSettingsIdRef.current;
    const nextNotificationSettings = {
      breakingNews: nextSettings["속보"],
      commentReplies: nextSettings["내 댓글/대댓글 반응"],
      darkMode: nextDarkMode,
      inquiryReplies: nextSettings["문의글 답변"],
      newsViewTime: nextSettings["뉴스 보기 타임 알림"],
      policyUpdates: nextSettings["내 국가정책 업데이트"],
    };

    if (!settingsId) {
      notificationApi
        .createNotificationSettings({
          userId: currentUserId,
          ...nextNotificationSettings,
        })
        .then((settings) => {
          notificationSettingsIdRef.current = settings.id;
        })
        .catch(() => undefined);
      return;
    }

    notificationApi
      .updateNotificationSettings(settingsId, nextNotificationSettings)
      .catch(() => undefined);
  };

  const toggleNotificationSetting = (label: (typeof myNotificationLabels)[number]) => {
    const nextSettings = {
      ...notificationSettings,
      [label]: !notificationSettings[label],
    } as Record<(typeof myNotificationLabels)[number], boolean>;

    setNotificationSettings(nextSettings);
    saveNotificationSettings(nextSettings);
  };

  const saveNewsViewTimes = (nextTimes: Set<string>) => {
    const nextTimeList = Array.from(nextTimes);
    const settingsId = userNewsViewTimeIdRef.current;

    if (settingsId) {
      settingsApi
        .updateUserNewsViewTimes(settingsId, { times: nextTimeList })
        .catch(() => undefined);
      return;
    }

    settingsApi
      .createUserNewsViewTimes(currentUserId, nextTimeList)
      .then((settings) => {
        userNewsViewTimeIdRef.current = settings.id;
      })
      .catch(() => undefined);
  };

  const toggleCategorySetting = (groupIndex: number, optionId: string) => {
    setSelectedCategorySettings((current) => {
      const nextSettings = current.map((selectedItems, index) => {
        if (index !== groupIndex) {
          return selectedItems;
        }

        if (groupIndex === 1) {
          return new Set([optionId]);
        }

        const nextItems = new Set(selectedItems);

        if (nextItems.has(optionId)) {
          nextItems.delete(optionId);
        } else {
          nextItems.add(optionId);
        }

        return nextItems;
      });

      saveUserPreference(nextSettings);
      return nextSettings;
    });
  };

  const toggleNewsViewTime = (time: string) => {
    setSelectedNewsViewTimes((current) => {
      const next = new Set(current);

      if (next.has(time)) {
        next.delete(time);
      } else {
        next.add(time);
      }

      saveNewsViewTimes(next);
      return next;
    });
  };

  const closeBlockedKeywordDialog = useCallback(() => {
    setIsBlockedKeywordDialogOpen(false);
    setBlockedKeywordInputValue("");
  }, []);

  const saveBlockedKeyword = () => {
    const nextKeyword = blockedKeywordInputValue.trim();

    if (!nextKeyword) {
      return;
    }

    onAddBlockedKeyword(nextKeyword);
    closeBlockedKeywordDialog();
  };

  const getSelectedCategoryValue = (groupIndex: number) =>
    Array.from(selectedCategorySettings[groupIndex] ?? [])[0] ??
    getMyCategoryOptionId(groupIndex, 0);

  const refreshProfileSettingsData = useCallback(() => {
    void Promise.all([
      userApi.getCurrentUser(currentUserId).catch(() => null),
      userApi.getUsers().catch(() => []),
      inquiryApi.getInquiries(currentUserId).catch(() => []),
      userContentActionApi.getActions(currentUserId).catch(() => []),
    ]).then(([
      nextProfileUser,
      nextProfileUsers,
      nextInquiryItems,
      nextContentActionItems,
    ]) => {
      setProfileUser(nextProfileUser);
      setProfileUsers(nextProfileUsers);
      setMyInquiryItems(nextInquiryItems);
      setMyContentActionItems(nextContentActionItems);
    });
  }, []);

  const openNewsViewTime = () => {
    myDetailScrollRestore.captureScroll();
    setActiveDetailView("newsViewTime");
  };

  const openCustomNewsSettings = () => {
    myDetailScrollRestore.captureScroll();
    setActiveDetailView("customNewsSettings");
  };

  const openProfileSettings = () => {
    myDetailScrollRestore.captureScroll();
    refreshProfileSettingsData();
    setActiveProfileSettingItemId(null);
    setActiveDetailView("profileSettings");
  };

  const openProfileSettingItem = (
    sectionIndex: number,
    itemIndex: number,
  ) => {
    const itemId = getMyProfileSettingItemId(sectionIndex, itemIndex);

    if (!itemId) {
      return;
    }

    refreshProfileSettingsData();
    setActiveProfileSettingItemId(itemId);
  };

  const updateProfileUser = async (input: UpdateUserInput) => {
    if (input.email) {
      const sameEmailUser = await userApi.getUserByEmail(input.email);

      if (sameEmailUser && sameEmailUser.id !== currentUserId) {
        throw new Error("Duplicate email");
      }
    }

    if (input.nickname) {
      const sameNicknameUser = await userApi.getUserByNickname(input.nickname);

      if (sameNicknameUser && sameNicknameUser.id !== currentUserId) {
        throw new Error("Duplicate nickname");
      }
    }

    const nextUser = await userApi.updateUser(currentUserId, input);
    setProfileUser(nextUser);
    setCurrentUserSession(
      { id: nextUser.id, nickname: nextUser.nickname },
      { remember: true },
    );
  };

  const updateProfilePassword = async (
    currentPassword: string,
    nextPassword: string,
  ) => {
    const nextProfileUser = profileUser ?? (await userApi.getCurrentUser(currentUserId));

    if (nextProfileUser.password !== currentPassword) {
      throw new Error("Invalid password");
    }

    const nextUser = await userApi.updateUser(currentUserId, {
      password: nextPassword,
    });
    setProfileUser(nextUser);
  };

  const deleteContentAction = async (actionId: string) => {
    setMyContentActionItems((currentItems) =>
      currentItems.filter((item) => item.id !== actionId),
    );

    try {
      await userContentActionApi.deleteAction(actionId);
    } catch {
      return;
    }
  };

  const openSummaryDetail = (view: MySummaryView) => {
    myDetailScrollRestore.captureScroll();
    setMyArticleDetail(null);
    setMyPolicyDetail(null);
    setActiveDetailView(view);
  };

  const openRecentDetail = () => {
    myDetailScrollRestore.captureScroll();
    setMyArticleDetail(null);
    setMyPolicyDetail(null);
    setActiveDetailView("recent");
  };

  const openMyArticleDetail: OpenArticleDetail = (article, options) => {
    myArticleDetailScrollRestore.captureScroll();
    setMyPolicyDetail(null);
    setMyArticleDetail({
      article,
      commentId: options?.commentId,
      replyToCommentId: options?.replyToCommentId,
      scrollTarget: options?.scrollTarget,
    });
  };

  const openMyPolicyDetail = (policy: PolicyItem) => {
    myArticleDetailScrollRestore.captureScroll();
    setMyArticleDetail(null);
    setMyPolicyDetail(policy);
  };

  const detailBackLabel =
    isMyNestedDetailOpen
      ? "기사 본문에서 이전 목록으로 돌아가기"
      : activeDetailView === "profileSettings"
      ? "설정에서 마이페이지로 돌아가기"
      : activeDetailView === "customNewsSettings"
      ? "맞춤형 뉴스 설정에서 마이페이지로 돌아가기"
      : "뉴스 보기 타임 설정에서 마이페이지로 돌아가기";
  const handleMyDetailBack = isMyNestedDetailOpen
    ? myArticleDetailExitMotion.closeWithMotion
    : activeProfileSettingItemId
      ? () => setActiveProfileSettingItemId(null)
    : myDetailExitMotion.closeWithMotion;

  return (
    <NewsRollCommonLayout
      aria-label="마이페이지"
      className="sheetFrame container_myScreen"
      dockedGap={pagePanelDockedGap}
      initialGap={pagePanelInitialGap}
      {...fixedDockedPanelProps}
      minInitialTop={pagePanelInitialTop}
      sheetClassName="sheetFrameSheet container_homeSheet container_mySheet"
      sheetNestedScrollResetSelector={
        isMyArticleDetailOpen ? homeDockedScrollSelectors.contentScroller : undefined
      }
      sheetScrollSelector={
        isMyArticleDetailOpen ? newsrollNewsFeedDetailSelector : pagePanelContentSelector
      }
      top={
        isMyDetailOpen ? (
          <NewsRollHeaderTop>
            <NewsToolbar
              isTextLarge={isTextLarge}
              onOpenNotifications={onOpenNotifications}
              onOpenSearch={onOpenSearch}
              onToggleTextSize={onToggleTextSize}
            />
            <NewsRollDockedControls
              className="motion_dockedPop allDockedControls panelHeaderRow"
              isDetailOpen
            >
              <NewsRollDetailBackButton
                ariaLabel={detailBackLabel}
                onClick={handleMyDetailBack}
              />
              <DockedAlarmButton
                isPressed={false}
                onClick={onOpenBreakingNews}
              />
            </NewsRollDockedControls>
          </NewsRollHeaderTop>
        ) : (
          <NewsRollHeaderTop>
            <NewsToolbar
              isTextLarge={isTextLarge}
              onOpenNotifications={onOpenNotifications}
              onOpenSearch={onOpenSearch}
              onToggleTextSize={onToggleTextSize}
            />
            <NewsRollDockedControls className="motion_dockedPop allDockedControls panelHeaderRow">
              <h1 className="text_panelHeaderTitle">마이페이지</h1>
              <DockedAlarmButton
                isPressed={false}
                onClick={onOpenBreakingNews}
              />
            </NewsRollDockedControls>
          </NewsRollHeaderTop>
        )
      }
    >
      {myArticleDetail ? (
        <ArticleDetailContent
          article={myArticleDetail.article}
          initialCommentId={myArticleDetail.commentId}
          initialReplyTargetId={myArticleDetail.replyToCommentId}
          initialScrollTarget={myArticleDetail.scrollTarget}
          isLeaving={myArticleDetailExitMotion.isLeaving}
        />
      ) : myPolicyDetail ? (
        <NewsRollPagePanel
          ariaLabel="국가정책 상세 콘텐츠 영역"
          contentRef={myPanelContentRef}
          key={`my-policy-detail-${myPolicyDetail.id ?? myPolicyDetail.title}`}
        >
          <PolicyDetailContent
            hideDetailToggle
            isLeaving={myArticleDetailExitMotion.isLeaving}
            item={myPolicyDetail}
          />
        </NewsRollPagePanel>
      ) : (
        <NewsRollPagePanel
          ariaLabel={
            isRecentOpen
              ? "최근 본 뉴스 상세 콘텐츠 영역"
            : isBookmarkOpen
              ? "북마크 상세 콘텐츠 영역"
            : isVoteOpen
              ? "투표 상세 콘텐츠 영역"
            : isCommentOpen
              ? "댓글 상세 콘텐츠 영역"
            : isNewsViewTimeOpen
            ? "뉴스 보기 타임 설정 영역"
            : isProfileSettingsOpen
              ? "설정 콘텐츠 영역"
            : "마이페이지 콘텐츠 영역"
          }
          contentRef={myPanelContentRef}
        >
          {isRecentOpen ? (
            <MyRecentDetailPage
              activeCategory={activeRecentCategory}
              items={myDynamicRecentItems}
              isLeaving={myDetailExitMotion.isLeaving}
              onCategoryChange={setActiveRecentCategory}
              onDeleteRecentViews={deleteRecentViews}
              onOpenArticle={openMyArticleDetail}
              showTabs={shouldShowRecentCategoryTabs}
              tabs={dynamicRecentCategoryTabs}
            />
          ) : isBookmarkOpen ? (
            <MyBookmarkDetailPage
              activeNewsCategory={activeBookmarkNewsCategory}
              activePolicyAgeLabel={activeBookmarkPolicyAgeLabel}
              activeType={activeBookmarkType}
              items={myDynamicBookmarkItems}
              isLeaving={myDetailExitMotion.isLeaving}
              newsCategoryTabs={dynamicBookmarkNewsCategoryTabs}
              onNewsCategoryChange={setActiveBookmarkNewsCategory}
              onOpenArticle={openMyArticleDetail}
              onOpenPolicy={openMyPolicyDetail}
              onPolicyAgeChange={setActiveBookmarkPolicyAgeLabel}
              onTypeChange={setActiveBookmarkType}
              policyAgeTabs={dynamicBookmarkPolicyAgeTabs}
              showNewsCategoryTabs={shouldShowBookmarkNewsCategoryTabs}
              showPolicyAgeTabs={shouldShowBookmarkPolicyAgeTabs}
            />
          ) : isVoteOpen ? (
            <MyVoteDetailPage
              activeCategory={activeVoteCategory}
              items={myDynamicVoteItems}
              isLeaving={myDetailExitMotion.isLeaving}
              onCategoryChange={setActiveVoteCategory}
              onOpenArticle={openMyArticleDetail}
              showTabs={shouldShowVoteCategoryTabs}
              tabs={dynamicVoteCategoryTabs}
            />
          ) : isCommentOpen ? (
            <MyCommentDetailPage
              activeCategory={activeCommentCategory}
              items={myDynamicCommentItems}
              isLeaving={myDetailExitMotion.isLeaving}
              onCategoryChange={setActiveCommentCategory}
              onOpenArticle={openMyArticleDetail}
              showTabs={shouldShowCommentKindTabs}
              tabs={dynamicCommentCategoryTabs}
            />
          ) : isCustomNewsSettingsOpen ? (
            <MyCustomNewsSettingsPage
              blockedKeywordInputValue={blockedKeywordInputValue}
              blockedKeywordSettings={blockedKeywordSettings}
              categoryGroups={myCategoryGroups}
              getCategoryTabItems={getMyCategoryTabItems}
              getCategoryValue={getSelectedCategoryValue}
              isBlockedKeywordDialogOpen={isBlockedKeywordDialogOpen}
              isLeaving={myDetailExitMotion.isLeaving}
              onCancelBlockedKeywordDialog={closeBlockedKeywordDialog}
              onDeleteBlockedKeyword={onDeleteBlockedKeyword}
              onInputBlockedKeywordChange={setBlockedKeywordInputValue}
              onOpenBlockedKeywordDialog={() => setIsBlockedKeywordDialogOpen(true)}
              onSaveBlockedKeyword={saveBlockedKeyword}
              onToggleBlockedKeyword={onToggleBlockedKeyword}
              onToggleCategorySetting={toggleCategorySetting}
              selectedCategorySettings={selectedCategorySettings}
            />
          ) : isNewsViewTimeOpen ? (
            <MyNewsViewTimePage
              isLeaving={myDetailExitMotion.isLeaving}
              onToggleTime={toggleNewsViewTime}
              sections={myNewsViewTimeSections}
              selectedTimes={selectedNewsViewTimes}
            />
          ) : isProfileSettingsOpen ? (
            activeProfileSettingItemId ? (
              <MyProfileSettingDetailPage
                actions={myContentActionItems}
                inquiries={myInquiryItems}
                isLeaving={myDetailExitMotion.isLeaving}
                itemId={activeProfileSettingItemId}
                onDeleteContentAction={deleteContentAction}
                onPasswordSubmit={updateProfilePassword}
                onUserSubmit={updateProfileUser}
                user={profileUser}
                users={profileUsers}
              />
            ) : (
              <MyProfileSettingsPage
                isLeaving={myDetailExitMotion.isLeaving}
                onItemSelect={openProfileSettingItem}
                sections={myOrderedProfileSettingSections}
              />
            )
        ) : (
          <div className="container_myContent">
          <section className="container_myProfile" aria-label="프로필">
            <span className="wrapper_myProfileGreeting">
              <strong>{currentUser.nickname}님</strong>
              <span>안녕하세요</span>
            </span>
            <div className="wrapper_articleActions wrapper_actionGroup u_itemsCenter" aria-label="프로필 도구" role="group">
              <IconButton
                aria-pressed={isProfileSettingsOpen}
                icon="setting"
                label="설정"
                onClick={openProfileSettings}
                variant="articleTool"
              />
            </div>
          </section>

          <div
            className="wrapper_articleReaction wrapper_myActivity"
            aria-label="활동 통계"
            role="group"
          >
            {mySummaryItems.map((item) => (
              <IconTextButton
                aria-pressed={activeSummary === item.value}
                icon={item.icon}
                key={item.value}
                onClick={() => openSummaryDetail(item.value)}
                tone={item.tone}
                size="default"
              >
                <strong>
                  {item.label} {myActivityCounts[item.value]}
                </strong>
              </IconTextButton>
            ))}
          </div>

          <section className="container_myRecent" aria-label="최근 본 뉴스">
            <h2 className="text_mySectionTitle">최근 본 뉴스</h2>
            {myDynamicRecentItems.length === 0 ? (
              <div className="wrapper_myRecentScroller wrapper_myPageRecentBlock">
                {Array.from({ length: myRecentPreviewLimit }, (_, index) => (
                  <NewsBlockCardSkeleton key={index} />
                ))}
              </div>
            ) : (
              <>
                <div className="wrapper_myRecentScroller wrapper_myPageRecentBlock">
                  {myDynamicRecentItems.slice(0, myRecentPreviewLimit).map((item, index) => (
                    <NewsBlockCardButton
                      ariaPressed={false}
                      dateLabel={item.time}
                      dateTime={item.dateTime}
                      imageSrc={item.image}
                      key={`${item.title}-${index}`}
                      onClick={() => openMyArticleDetail(createMyRecentArticle(item, index))}
                      showDate={false}
                      title={item.title}
                    />
                  ))}
                </div>
                <MoreActionButton
                  ariaLabel="최근 본 뉴스 전체 보기"
                  collapsedLabel="전체 보기"
                  onClick={openRecentDetail}
                  showIcon={false}
                />
              </>
            )}
          </section>

          <section className="container_mySettingsSection">
            <Divider className="divider_mySection" />
            <h2 className="text_mySectionTitle">뉴스 설정</h2>
            <div className="wrapper_mySettingsList wrapper_scrollList">
              <MySettingRow
                label="맞춤형 뉴스 설정"
                onClick={openCustomNewsSettings}
                showChevron
              />
            </div>
          </section>

          <section
            className="container_mySettingsSection"
            data-my-section="notification-settings"
          >
            <Divider className="divider_mySection" />
            <h2 className="text_mySectionTitle">알림 설정</h2>
            <div className="wrapper_mySettingsList wrapper_scrollList">
              {myNotificationLabels.map((label) => (
                <MySettingRow
                  checked={notificationSettings[label]}
                  key={label}
                  label={label}
                  onClick={() => toggleNotificationSetting(label)}
                />
              ))}
              <MySettingRow
                label="뉴스보기 타임"
                onClick={openNewsViewTime}
                showChevron
              />
            </div>
          </section>

          <section className="container_mySettingsSection">
            <Divider className="divider_mySection" />
            <h2 className="text_mySectionTitle">디스플레이 설정</h2>
            <div className="wrapper_mySettingsList wrapper_scrollList">
              <MySettingRow
                checked={isDarkMode}
                label="다크모드"
                onClick={() => {
                  const nextDarkMode = !isDarkMode;

                  onDarkModeChange(nextDarkMode);
                  saveNotificationSettings(notificationSettings, nextDarkMode);
                }}
              />
            </div>
          </section>

          <section className="container_mySettingsSection">
            <Divider className="divider_mySection" />
            <TextButton
              className="btn_myLogout"
              type="button"
              onClick={() => setIsLogoutDialogOpen(true)}
            >
              로그아웃
            </TextButton>
          </section>
          {isLogoutDialogOpen ? (
            <ConfirmDialog
              message="로그아웃 하시겠습니까?"
              onCancel={() => setIsLogoutDialogOpen(false)}
              onConfirm={() => {
                setIsLogoutDialogOpen(false);
                onLogout();
              }}
            />
          ) : null}
          </div>
        )}
      </NewsRollPagePanel>
      )}
    </NewsRollCommonLayout>
  );
}
