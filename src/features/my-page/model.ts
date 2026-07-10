import type {
  NotificationSettings,
  UserNewsViewTime,
  UserPreference,
} from "@/shared/newstant/api";
import type { MyCommentKind } from "@/features/my-page/detail/MyCommentDetailPage";
import type { MyProfileSettingItemId } from "@/features/my-page/detail/MyProfileSettingDetailPage";
import type { PolicyItem } from "@/features/news/model";

export const myRecentPreviewLimit = 10;

export const myCategoryGroups = [
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
export const myPolicyAgeLabelById = {
  middle: "중장년",
  minor: "미성년",
  senior: "노년",
  youth: "청년",
} as const;
const myNewsCategoryPreferenceIds = [
  "politics",
  "economy",
  "society",
  "culture",
  "world",
  "local",
  "sports",
  "science",
] as const;
const myPressPreferenceIds = ["joongang", "kukmin", "hani"] as const;

export function getMyCategoryOptionId(groupIndex: number, itemIndex: number) {
  return `${groupIndex}-${itemIndex}`;
}

function getPreferenceOptionId(
  groupIndex: number,
  preferenceIds: readonly string[],
  preferenceId?: string,
) {
  const itemIndex = preferenceIds.findIndex((id) => id === preferenceId);

  return itemIndex >= 0 ? getMyCategoryOptionId(groupIndex, itemIndex) : "";
}

function getPreferenceIdFromOption(
  groupIndex: number,
  preferenceIds: readonly string[],
  optionId?: string,
) {
  const itemIndex = preferenceIds.findIndex(
    (_, index) => getMyCategoryOptionId(groupIndex, index) === optionId,
  );

  return itemIndex >= 0 ? preferenceIds[itemIndex] : "";
}

function getAgeGroupOptionId(ageGroupId?: string) {
  return getPreferenceOptionId(1, myAgeGroupPreferenceIds, ageGroupId);
}

export function getAgeGroupPreferenceId(optionId?: string) {
  return getPreferenceIdFromOption(1, myAgeGroupPreferenceIds, optionId);
}

function getNewsCategoryOptionIds(categoryIds: string[]) {
  return categoryIds
    .map((categoryId) =>
      getPreferenceOptionId(0, myNewsCategoryPreferenceIds, categoryId),
    )
    .filter((optionId): optionId is string => Boolean(optionId));
}

export function getNewsCategoryPreferenceIds(optionIds: string[]) {
  return optionIds
    .map((optionId) =>
      getPreferenceIdFromOption(0, myNewsCategoryPreferenceIds, optionId),
    )
    .filter((categoryId): categoryId is string => Boolean(categoryId));
}

function getPressOptionIds(pressIds: string[]) {
  return pressIds
    .map((pressId) => getPreferenceOptionId(2, myPressPreferenceIds, pressId))
    .filter((optionId): optionId is string => Boolean(optionId));
}

export function getPressPreferenceIds(optionIds: string[]) {
  return optionIds
    .map((optionId) =>
      getPreferenceIdFromOption(2, myPressPreferenceIds, optionId),
    )
    .filter((pressId): pressId is string => Boolean(pressId));
}

export function getMyCategoryTabItems(groupIndex: number) {
  return myCategoryGroups[groupIndex].items.map((item, itemIndex) => ({
    id: getMyCategoryOptionId(groupIndex, itemIndex),
    label: item,
  }));
}

export function getInitialCategorySettings() {
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
export function getCategorySettingsFromPreference(preference: UserPreference | null) {
  const initialSettings = getInitialCategorySettings();

  if (!preference) {
    return initialSettings;
  }

  const categoryIds = getNewsCategoryOptionIds(preference.categoryIds);
  const ageGroupOptionId = getAgeGroupOptionId(preference.ageGroupId);
  const ageGroupIds = ageGroupOptionId ? [ageGroupOptionId] : [];
  const pressIds = getPressOptionIds(preference.pressIds);

  return [
    new Set(categoryIds.length > 0 ? categoryIds : initialSettings[0]),
    new Set(ageGroupIds.length > 0 ? ageGroupIds : initialSettings[1]),
    new Set(pressIds.length > 0 ? pressIds : initialSettings[2]),
  ];
}

export function getNotificationSettingsFromApi(settings: NotificationSettings | null) {
  return {
    "속보": settings?.breakingNews ?? true,
    "내 댓글/대댓글 반응": settings?.commentReplies ?? true,
    "내 국가정책 업데이트": settings?.policyUpdates ?? true,
    "문의글 답변": settings?.inquiryReplies ?? true,
    "뉴스 보기 타임 알림": settings?.newsViewTime ?? true,
  };
}

export function getNewsViewTimesFromApi(settings: UserNewsViewTime | null) {
  return new Set(settings?.times?.length ? settings.times : ["07:00", "21:00"]);
}

export const mySummaryItems = [
  { count: 56, icon: "bookmark", label: "북마크", tone: "bookmark", value: "bookmark" },
  { count: 54, icon: "vote", label: "투표", tone: "vote", value: "vote" },
  { count: 15, icon: "chat", label: "댓글", tone: "comment", value: "comment" },
] as const;
export const myNotificationLabels = [
  "속보",
  "내 댓글/대댓글 반응",
  "내 국가정책 업데이트",
  "문의글 답변",
  "뉴스 보기 타임 알림",
] as const;
export type MySummaryView = (typeof mySummaryItems)[number]["value"];
export type MyPageDetailView =
  | "recent"
  | "customNewsSettings"
  | "newsViewTime"
  | "profileSettings"
  | MySummaryView
  | null;

export const mySummaryAllTabLabel = "전체";
export const myBookmarkTabs = ["뉴스", "국가정책"] as const;
export const myCommentTabs = [
  { id: "comment", label: "댓글" },
  { id: "reply", label: "대댓글" },
] as const;

function getUniqueValues<T extends string>(items: T[]) {
  return Array.from(new Set(items));
}

export function getMySummaryCategoryTabs(items: { category: string }[]) {
  return [
    mySummaryAllTabLabel,
    ...getUniqueValues(items.map((item) => item.category)),
  ];
}

export function getMyPolicyAgeTabs(items: { policyAgeLabels: string[] }[]) {
  return [
    mySummaryAllTabLabel,
    ...getUniqueValues(items.flatMap((item) => item.policyAgeLabels)),
  ];
}

export function shouldShowMyCategoryTabs(items: { category: string }[]) {
  return getUniqueValues(items.map((item) => item.category)).length > 1;
}

export function hasMultipleMyCommentKinds(items: { commentKind: Exclude<MyCommentKind, "all"> }[]) {
  return getUniqueValues(items.map((item) => item.commentKind)).length > 1;
}

const dummyDateLabel = "0000년 00월 00일";

function formatPolicyBookmarkDate(_value: string) {
  return dummyDateLabel;
}

export function getPolicyBookmarkItem(policy: {
  ageGroupIds?: string[];
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
    ageGroupIds: policy.ageGroupIds,
    details: [
      { label: "지원 대상 연령", value: policy.targetAge },
      { label: "지원 내용", value: policy.supportContent },
      { label: "지원 기관", value: policy.institution },
      {
        label: "사업 기간",
        value: `${dummyDateLabel} ~ ${dummyDateLabel}`,
      },
      {
        label: "신청 기간",
        value: `${dummyDateLabel} ~ ${dummyDateLabel}`,
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

export const myNewsViewTimeSections = [
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
    title: "Newstant",
    items: [
      "앱 정보",
      "오픈소스 라이선스",
      "개인정보 처리방침 변경 이력",
      "서비스 약관 변경 이력",
    ],
  },
] as const;

export const myOrderedProfileSettingSections = [
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

export function getMyProfileSettingItemId(sectionIndex: number, itemIndex: number) {
  return myProfileSettingItemIds[sectionIndex]?.[itemIndex] ?? null;
}

