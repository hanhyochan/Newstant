"use client";

import {
  useCallback,
  useEffect,
  useMemo,
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
  type NotificationSettings,
  type UpdateUserInput,
  type User,
  type UserContentAction,
  type UserNewsViewTime,
  type UserPreference
} from "@/app/_newsroll/api";
import {
  currentUserId,
  getCurrentUserSnapshot,
  setCurrentUserSession,
} from "@/app/_newsroll/auth/current-user";
import { fixedDockedPanelProps } from "@/app/_newsroll/my-info-panel-behavior";
import {
  IconButton,
  NewsBlockItem,
  NewsRollDivider,
  ReactionButton
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
  useEnterFromRightExitMotion
} from "@/design-system/templates";
import {
  getCommentItemFromApi,
  type CommentId
} from "@/features/comments/utils/comment-data";
import { ConfirmDialog } from "@/features/shared/ConfirmDialog";
import { MySettingRow } from "@/features/my-page/components/MySettingRow";
import {
  MyBookmarkDetailPage,
  type MyBookmarkNewsSummaryItem,
  type MyBookmarkPolicySummaryItem,
  type MyBookmarkSummaryItem,
} from "@/features/my-page/detail/MyBookmarkDetailPage";
import {
  MyCommentDetailPage,
  type MyCommentKind,
  type MyCommentSummaryItem,
} from "@/features/my-page/detail/MyCommentDetailPage";
import { MyCustomNewsSettingsPage } from "@/features/my-page/detail/MyCustomNewsSettingsPage";
import { MyNewsViewTimePage } from "@/features/my-page/detail/MyNewsViewTimePage";
import { MyProfileSettingsPage } from "@/features/my-page/detail/MyProfileSettingsPage";
import {
  MyProfileSettingDetailPage,
  type MyProfileSettingItemId,
} from "@/features/my-page/detail/MyProfileSettingDetailPage";
import {
  MyRecentDetailPage,
  createMyRecentArticle,
  type MyRecentSummaryItem,
} from "@/features/my-page/detail/MyRecentDetailPage";
import {
  MyVoteDetailPage,
  type MyVoteSummaryItem,
} from "@/features/my-page/detail/MyVoteDetailPage";
import { buildMyActivitySummary } from "@/features/my-page/utils/my-activity-summary";
import { PolicyDetailContent } from "@/features/policy/PolicyDetailContent";
import { DockedAlarmButton, NewsToolbar } from "@/features/shell/NewsRollToolbar";

import {
  ArticleDetailContent,
  binaryGuideOptions,
  formatNewsDate,
  getAllNewsPreviewFromArticle,
  getHomeArticleFromNews,
  guideOptions,
  type ArticleDetailOpenOptions,
  type BlockedKeywordSetting,
  type HomeArticle,
  type OpenArticleDetail,
  type PolicyItem
} from "@/features/news/NewsViews";
import { DataUnavailableMessage } from "@/features/shared/DataUnavailableMessage";
import { MoreActionButton } from "@/features/shared/MoreActionButton";

const myRecentPreviewLimit = 10;

const myCategoryGroups = [
  {
    items: ["정치", "경제", "사회", "문화", "국제", "지역", "스포츠", "IT과학"],
    title: "나의 관심 카테고리 설정",
    active: new Set(["정치"]),
  },
  {
    items: ["미성년", "청년", "중장년", "노년"],
    title: "나의 연령대 설정",
    active: new Set(["청년"]),
  },
  {
    items: ["중앙일보", "국민일보", "한겨레"],
    title: "관심 언론사 설정",
    active: new Set(["중앙일보", "국민일보", "한겨레"]),
  },
];

const myAgeGroupPreferenceIds = ["minor", "youth", "middle", "senior"] as const;

function getMyCategoryOptionId(groupIndex: number, itemIndex: number) {
  return `${groupIndex}-${itemIndex}`;
}

function getAgeGroupOptionId(ageGroupId?: string) {
  const itemIndex = myAgeGroupPreferenceIds.findIndex((id) => id === ageGroupId);

  return itemIndex >= 0 ? getMyCategoryOptionId(1, itemIndex) : "";
}

function getAgeGroupPreferenceId(optionId?: string) {
  const itemIndex = myAgeGroupPreferenceIds.findIndex(
    (_, index) => getMyCategoryOptionId(1, index) === optionId,
  );

  return itemIndex >= 0 ? myAgeGroupPreferenceIds[itemIndex] : "";
}

function getMyCategoryTabItems(groupIndex: number) {
  return myCategoryGroups[groupIndex].items.map((item, itemIndex) => ({
    id: getMyCategoryOptionId(groupIndex, itemIndex),
    label: item,
  }));
}

function getInitialCategorySettings() {
  return myCategoryGroups.map(
    (group, groupIndex) =>
      new Set(
        group.items
          .map((item, itemIndex) =>
            group.active.has(item)
              ? getMyCategoryOptionId(groupIndex, itemIndex)
              : null,
          )
          .filter((item): item is string => Boolean(item)),
      ),
  );
}
function getCategorySettingsFromPreference(preference: UserPreference | null) {
  const initialSettings = getInitialCategorySettings();

  if (!preference) {
    return initialSettings;
  }

  const getValidOptionIds = (groupIndex: number, optionIds: string[]) => {
    const validIds = new Set(getMyCategoryTabItems(groupIndex).map((item) => item.id));
    return optionIds.filter((optionId) => validIds.has(optionId));
  };

  const categoryIds = getValidOptionIds(0, preference.categoryIds);
  const ageGroupOptionId = getAgeGroupOptionId(preference.ageGroupId);
  const ageGroupIds = ageGroupOptionId ? [ageGroupOptionId] : [];
  const pressIds = getValidOptionIds(2, preference.pressIds);

  return [
    new Set(categoryIds.length > 0 ? categoryIds : initialSettings[0]),
    new Set(ageGroupIds.length > 0 ? ageGroupIds : initialSettings[1]),
    new Set(pressIds.length > 0 ? pressIds : initialSettings[2]),
  ];
}

function getNotificationSettingsFromApi(settings: NotificationSettings | null) {
  return {
    "속보": settings?.breakingNews ?? true,
    "내 댓글/대댓글 반응": settings?.commentReplies ?? true,
    "내 국가정책 업데이트": settings?.policyUpdates ?? true,
    "문의글 답변": settings?.inquiryReplies ?? true,
    "뉴스 보기 타임 알림": settings?.newsViewTime ?? true,
  };
}

function getNewsViewTimesFromApi(settings: UserNewsViewTime | null) {
  return new Set(settings?.times?.length ? settings.times : ["07:00", "21:00"]);
}

const mySummaryItems = [
  { count: 56, icon: "bookmark", label: "북마크", tone: "like", value: "bookmark" },
  { count: 54, icon: "vote", label: "투표", tone: "dislike", value: "vote" },
  { count: 15, icon: "chat", label: "댓글", tone: "neutral", value: "comment" },
] as const;
const myNotificationLabels = [
  "속보",
  "내 댓글/대댓글 반응",
  "내 국가정책 업데이트",
  "문의글 답변",
  "뉴스 보기 타임 알림",
] as const;
type MySummaryView = (typeof mySummaryItems)[number]["value"];
type MyPageDetailView =
  | "recent"
  | "customNewsSettings"
  | "newsViewTime"
  | "profileSettings"
  | MySummaryView
  | null;

const mySummaryAllTabLabel = "전체";
const myVoteCategoryTabs = [mySummaryAllTabLabel];
const myBookmarkTabs = ["뉴스", "국가정책"] as const;
const myCommentTabs = [
  { id: "all", label: "전체" },
  { id: "comment", label: "댓글" },
  { id: "reply", label: "대댓글" },
] as const;

function getUniqueValues<T extends string>(items: T[]) {
  return Array.from(new Set(items));
}

function getMySummaryCategoryTabs(items: { category: string }[]) {
  return [
    mySummaryAllTabLabel,
    ...getUniqueValues(items.map((item) => item.category)),
  ];
}

function hasMultipleMySummaryCategories(items: { category: string }[]) {
  return getUniqueValues(items.map((item) => item.category)).length > 1;
}

function hasMultipleMyCommentKinds(items: { commentKind: Exclude<MyCommentKind, "all"> }[]) {
  return getUniqueValues(items.map((item) => item.commentKind)).length > 1;
}

function formatPolicyBookmarkDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getPolicyBookmarkItem(policy: {
  applicationEndDate: string;
  applicationMethod: string;
  applicationStartDate: string;
  businessEndDate: string;
  businessStartDate: string;
  category: string;
  documents: string;
  id: string;
  institution: string;
  label: string;
  registeredAt: string;
  selectionMethod: string;
  subcategory: string;
  summary: string;
  supportContent: string;
  targetAge: string;
  title: string;
  updatedAt: string;
}): PolicyItem {
  return {
    details: [
      { label: "지원 대상 연령", value: policy.targetAge },
      { label: "지원 내용", value: policy.supportContent },
      { label: "지원 기관", value: policy.institution },
      {
        label: "사업 기간",
        value: `${policy.businessStartDate} ~ ${policy.businessEndDate}`,
      },
      {
        label: "신청 기간",
        value: `${policy.applicationStartDate} ~ ${policy.applicationEndDate}`,
      },
      { label: "신청 방법", value: policy.applicationMethod },
      { label: "선발 방식", value: policy.selectionMethod },
      { label: "제출 서류", value: policy.documents },
    ],
    id: policy.id,
    registeredAt: formatPolicyBookmarkDate(policy.registeredAt),
    summary: policy.summary,
    tags: [policy.category, policy.subcategory, policy.label],
    title: policy.title,
    updatedAt: formatPolicyBookmarkDate(policy.updatedAt),
  };
}

const myNewsViewTimeSections = [
  {
    label: "아침",
    times: ["06:00", "07:00", "08:00", "09:00"],
  },
  {
    label: "점심",
    times: ["11:00", "12:00", "13:00", "14:00"],
  },
  {
    label: "저녁",
    times: ["16:00", "17:00", "18:00", "19:00"],
  },
  {
    label: "밤",
    times: ["21:00", "22:00", "23:00"],
  },
] as const;

const myProfileSettingSections = [
  {
    title: "계정",
    items: ["내 정보 수정", "비밀번호 찾기 / 재설정"],
  },
  {
    title: "동의 및 약관",
    items: [
      "약관 동의",
      "개인정보 처리방침",
      "서비스 이용약관",
      "개인정보 수집·이용 동의",
      "마케팅/알림 수신 동의",
    ],
  },
  {
    title: "활동 관리",
    items: ["문의 내역", "신고 내역", "차단/숨김 설정"],
  },
  {
    title: "NewsRoll",
    items: [
      "앱 정보",
      "오픈소스 라이선스",
      "개인정보 처리방침 변경 이력",
      "서비스 약관 변경 이력",
    ],
  },
] as const;

const myOrderedProfileSettingSections = [
  myProfileSettingSections[0],
  myProfileSettingSections[2],
  myProfileSettingSections[1],
  myProfileSettingSections[3],
] as readonly (typeof myProfileSettingSections)[number][];

const myProfileSettingItemIds: MyProfileSettingItemId[][] = [
  ["accountEdit", "passwordReset"],
  ["inquiryHistory", "reportHistory", "blockedHiddenSettings"],
  [
    "agreement",
    "privacyPolicy",
    "termsOfService",
    "privacyConsent",
    "marketingConsent",
  ],
  ["appInfo", "openSourceLicenses", "privacyPolicyHistory", "termsHistory"],
];

function getMyProfileSettingItemId(sectionIndex: number, itemIndex: number) {
  return myProfileSettingItemIds[sectionIndex]?.[itemIndex] ?? null;
}

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
  const [activeDetailView, setActiveDetailView] =
    useState<MyPageDetailView>(null);
  const [myArticleDetail, setMyArticleDetail] = useState<{
    article: HomeArticle;
    commentId?: CommentId;
    replyToCommentId?: CommentId;
    scrollTarget?: ArticleDetailOpenOptions["scrollTarget"];
  } | null>(null);
  const [myPolicyDetail, setMyPolicyDetail] = useState<PolicyItem | null>(null);
  const [activeVoteCategory, setActiveVoteCategory] = useState(
    () => myVoteCategoryTabs[0] ?? "",
  );
  const [activeBookmarkCategory, setActiveBookmarkCategory] = useState<string>(
    () => myBookmarkTabs[0],
  );
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
  >({
    "내 댓글/대댓글 반응": true,
    "내 국가정책 업데이트": true,
    "문의글 답변": true,
    "뉴스 보기 타임 알림": true,
    속보: true,
  });
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [profileUsers, setProfileUsers] = useState<User[]>([]);
  const [myInquiryItems, setMyInquiryItems] = useState<Inquiry[]>([]);
  const [myContentActionItems, setMyContentActionItems] = useState<
    UserContentAction[]
  >([]);
  const [activeProfileSettingItemId, setActiveProfileSettingItemId] =
    useState<MyProfileSettingItemId | null>(null);
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
  const dynamicCommentCategoryTabs = useMemo(
    () => myCommentTabs,
    [],
  );
  const dynamicBookmarkCategoryTabs = useMemo(
    () =>
      myBookmarkTabs.filter((category) =>
        myDynamicBookmarkItems.some((item) => item.category === category),
      ),
    [myDynamicBookmarkItems],
  );
  const dynamicVoteCategoryTabs = useMemo(
    () => getMySummaryCategoryTabs(myDynamicVoteItems),
    [myDynamicVoteItems],
  );
  const shouldShowBookmarkCategoryTabs = useMemo(
    () => dynamicBookmarkCategoryTabs.length > 1,
    [dynamicBookmarkCategoryTabs],
  );
  const shouldShowVoteCategoryTabs = useMemo(
    () => hasMultipleMySummaryCategories(myDynamicVoteItems),
    [myDynamicVoteItems],
  );
  const shouldShowCommentKindTabs = useMemo(
    () => hasMultipleMyCommentKinds(myDynamicCommentItems),
    [myDynamicCommentItems],
  );
  const myActivityCounts = useMemo(
    () =>
      Object.fromEntries(
        mySummaryItems.map((item) => [
          item.value,
          item.value === "comment"
            ? myDynamicCommentItems.length
            : item.value === "bookmark"
              ? myBookmarkCount
              : item.value === "vote"
                ? myVoteCount
                : 0,
        ]),
      ) as Record<MySummaryView, number>,
    [myBookmarkCount, myDynamicCommentItems.length, myVoteCount],
  );
  const activeSummary: MySummaryView | null =
    isBookmarkOpen || isVoteOpen || isCommentOpen ? activeDetailView : null;
  const isMyDetailOpen = activeDetailView !== null;
  const myDetailScrollRestore = useDetailScrollRestore({
    isDetailOpen: isMyDetailOpen,
    scrollerRef: myPanelContentRef,
  });
  const myArticleDetailScrollRestore = useDetailScrollRestore({
    isDetailOpen: isMyNestedDetailOpen,
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
          category: myBookmarkTabs[0],
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
        setActiveBookmarkCategory(myBookmarkTabs[0]);
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
        categoryIds: Array.from(nextSettings[0] ?? []),
        ageGroupId: getAgeGroupPreferenceId(Array.from(nextSettings[1] ?? [])[0]),
        pressIds: Array.from(nextSettings[2] ?? []),
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
      className="newsroll_sheetFrame container_myScreen"
      dockedGap={pagePanelDockedGap}
      initialGap={pagePanelInitialGap}
      {...fixedDockedPanelProps}
      minInitialTop={pagePanelInitialTop}
      sheetClassName="newsroll_sheetFrameSheet container_homeSheet container_mySheet"
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
              className="newsroll_motion_dockedPop newsroll_allDockedControls newsroll_panelHeaderRow"
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
            <NewsRollDockedControls className="newsroll_motion_dockedPop newsroll_allDockedControls newsroll_panelHeaderRow">
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
              items={myDynamicRecentItems}
              isLeaving={myDetailExitMotion.isLeaving}
              onDeleteRecentViews={deleteRecentViews}
              onOpenArticle={openMyArticleDetail}
            />
          ) : isBookmarkOpen ? (
            <MyBookmarkDetailPage
              activeCategory={activeBookmarkCategory}
              items={myDynamicBookmarkItems}
              isLeaving={myDetailExitMotion.isLeaving}
              onCategoryChange={setActiveBookmarkCategory}
              onOpenArticle={openMyArticleDetail}
              onOpenPolicy={openMyPolicyDetail}
              showTabs={shouldShowBookmarkCategoryTabs}
              tabs={dynamicBookmarkCategoryTabs}
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
            <div className="wrapper_articleActions" aria-label="프로필 도구" role="group">
              <IconButton
                aria-pressed={isProfileSettingsOpen}
                baseClassName="btn_articleTool"
                icon="setting"
                label="설정"
                onClick={openProfileSettings}
              />
            </div>
          </section>

          <div
            className="wrapper_articleReaction wrapper_myActivity"
            aria-label="활동 통계"
            role="group"
          >
            {mySummaryItems.map((item) => (
              <ReactionButton
                aria-pressed={activeSummary === item.value}
                icon={item.icon}
                key={item.value}
                onClick={() => openSummaryDetail(item.value)}
                tone={item.tone}
                variant="article"
              >
                <strong>
                  {item.label} {myActivityCounts[item.value]}
                </strong>
              </ReactionButton>
            ))}
          </div>

          <section className="container_myRecent" aria-label="최근 본 뉴스">
            <h2 className="text_mySectionTitle">최근 본 뉴스</h2>
            {myDynamicRecentItems.length === 0 ? (
              <DataUnavailableMessage target="최근 본 뉴스" />
            ) : (
              <>
                <div className="wrapper_myRecentScroller wrapper_myPageRecentBlock">
                  {myDynamicRecentItems.slice(0, myRecentPreviewLimit).map((item, index) => (
                    <NewsBlockItem
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
            <NewsRollDivider className="divider_mySection" />
            <h2 className="text_mySectionTitle">뉴스 설정</h2>
            <div className="wrapper_mySettingsList">
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
            <NewsRollDivider className="divider_mySection" />
            <h2 className="text_mySectionTitle">알림 설정</h2>
            <div className="wrapper_mySettingsList">
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
            <NewsRollDivider className="divider_mySection" />
            <h2 className="text_mySectionTitle">디스플레이 설정</h2>
            <div className="wrapper_mySettingsList">
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
            <NewsRollDivider className="divider_mySection" />
            <button
              className="btn_textAction btn_myLogout"
              type="button"
              onClick={() => setIsLogoutDialogOpen(true)}
            >
              로그아웃
            </button>
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
