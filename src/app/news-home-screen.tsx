"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type TouchEvent,
} from "react";
import { createPortal } from "react-dom";

import {
  ArticleActionButtons,
  BreakingNewsCardLink,
  Button,
  ChipLabel,
  CommentComposerInput,
  Icon,
  IconButton,
  NewsRollDivider,
  NewsRollDropdownArrow,
  NewsRollDropdownMenu,
  NewsRollSwitch,
  NewsBlockItem,
  NewsViewToggle,
  PillTabMenu,
  ReactionButton,
  TextInput,
  Textarea,
  TransparentTextInput,
  type IconName,
} from "@/design-system/components";
import {
  NewsRollArticleDetailPanel,
  NewsRollCommonLayout,
  NewsRollDetailBackButton,
  NewsRollDockedControls,
  NewsRollHeaderTop,
  NewsRollPagePanel,
  NewsRollSummaryHeroTop,
  useDeferredDetailScroll,
  useDockedPanelScroll,
  useDetailScrollRestore,
  useInlineTextEdit,
} from "@/design-system/templates";
import {
  bookmarkApi,
  commentApi,
  infoApi,
  inquiryApi,
  newsApi,
  notificationApi,
  pollApi,
  settingsApi,
  userApi,
  welfareApi,
  type ArticleReactionType,
  type BlockedKeywordPreference,
  type Comment,
  type CommentReaction,
  type Faq,
  type InquiryType,
  type NewsListItem,
  type Notice,
  type NotificationSettings,
  type UserNewsViewTime,
  type UserPreference,
  type WelfarePolicy,
} from "./_newsroll/api";
import { mockCurrentUserId } from "./_newsroll/mock-current-user";
import { fixedDockedPanelProps } from "./_newsroll/my-info-panel-behavior";

type Tab = "home" | "all" | "policy" | "my" | "info";
type View = Tab | "search" | "login";
type InfoTab = "notice" | "faq" | "inquiry";
type QuickMenuTarget = "customNewsSettings" | "notificationSettings" | "profileSettings";
type QuickMenuRequest = {
  id: number;
  returnView: Tab;
  target: QuickMenuTarget;
};
type HomeViewMode = "reels" | "block";
type Reaction = "like" | "dislike" | "neutral" | null;
type ReactionValue = Exclude<Reaction, null>;
type CommentReactionValue = "like" | "dislike";
type CommentSortOrder = "latest" | "popular";
type CommentAction = "block" | "delete" | "edit" | "hide" | "report";
type SortOrder = "popular" | "latest";
type GuideKind = "stacked" | "binary";
type CommentScrollTarget = {
  bottomGap?: number;
  delayMs?: number;
  id: string;
  stickToBottom?: boolean;
};
type CommentId = string;

type ArticleDetailOpenOptions = {
  commentId?: CommentId;
  replyToCommentId?: CommentId;
  scrollTarget?: "poll";
};

type OpenArticleDetail = (
  article: HomeArticle,
  options?: ArticleDetailOpenOptions,
) => void;

type HomeArticle = {
  body?: string;
  category: string;
  date: string;
  dateTime?: string;
  image: string;
  imageAlt: string;
  guideKind?: GuideKind;
  id?: string;
  pressName?: string;
  reporterName?: string;
  title: string;
  viewCount?: number;
};

type BreakingNewsItem = {
  article: HomeArticle;
  id: string;
  title: string;
  updatedAt: string;
};

type BlockedKeywordSetting = {
  id?: string;
  isActive: boolean;
  keyword: string;
};

type HomeHeaderControls = {
  breakingItem?: BreakingNewsItem | null;
  breakingTitle?: string;
  dockedControlsMotionClassName?: string;
  isDetailOpen?: boolean;
  isTextLarge: boolean;
  mode: HomeViewMode;
  newsCount: number;
  onCloseDetail?: () => void;
  onOpenBreakingArticle?: (article: HomeArticle) => void;
  onModeChange: (mode: HomeViewMode) => void;
  onOpenBreakingNews: () => void;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  onToggleTextSize: () => void;
};

type PolicyDetailItem = {
  label: string;
  value: string;
};

type PolicyItem = {
  details: PolicyDetailItem[];
  registeredAt: string;
  summary: string;
  tags: string[];
  title: string;
  updatedAt: string;
};

type InfoNoticeItem = {
  content: string;
  date: string;
  id: string;
  summary: string;
  title: string;
  updatedAt: string;
};

type CommentItem = {
  author: string;
  body: string;
  choice: string;
  createdAt?: string;
  date: string;
  dislikes: number;
  id: CommentId;
  isMine?: boolean;
  likes: number;
  replies: number;
};

const articleImage = "/images/news-apartment.png";
const defaultNewsDateTime = "2026-12-31T08:30:00";
const defaultNewsDateLabel = "2026년 12월 31일 08:30";
const homeSheetDockedGap = 40;
const homeSheetInitialGap = 40;
const homeSheetScrollSelector = ".container_newsFeed, .wrapper_newsGridScroll";
const pagePanelDockedGap = 40;
const pagePanelInitialGap = 40;
const pagePanelInitialTop = 492;
const commentScrollDelayMs = 120;
const nextArticleRevealDelayMs = 260;
const detailExitMotionEventName = "newsroll:detail-exit";
const homeDockedScrollSelectors = {
  contentScroller: ".wrapper_articleCardContent",
  panel: ".container_articleCard",
};
const pagePanelContentSelector = ".newsroll_page_panelContent";

function resetNewsRollViewport() {
  if (typeof window === "undefined") {
    return;
  }

  window.requestAnimationFrame(() => {
    const scrollTargets = [
        document.scrollingElement,
        document.documentElement,
        document.body,
        ...document.querySelectorAll<HTMLElement>(
          ".newsroll_phone, .newsroll_policy_screen, .container_myScreen, .newsroll_info_screen",
        ),
      ];

    scrollTargets.forEach((target) => {
      if (!target) {
        return;
      }

      target.scrollTop = 0;
      target.scrollLeft = 0;
    });
  });
}

function NewsCreatedTime({
  children = defaultNewsDateLabel,
  dateTime = defaultNewsDateTime,
}: {
  children?: ReactNode;
  dateTime?: string;
}) {
  return (
    <time className="newsroll_createdTime" dateTime={dateTime}>
      {children}
    </time>
  );
}

function formatNewsDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return defaultNewsDateLabel;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatHeroCount(count: number) {
  return new Intl.NumberFormat("ko-KR").format(count);
}

function getHomeArticleGuideKind(index: number): GuideKind {
  return index % 2 === 0 ? "stacked" : "binary";
}

function getHomeArticleFromNews(item: NewsListItem, index: number): HomeArticle {
  return {
    body: item.body,
    category: item.category?.label ?? item.categoryId,
    date: formatNewsDate(item.publishedAt),
    dateTime: item.publishedAt,
    guideKind: getHomeArticleGuideKind(index),
    id: item.id,
    image: item.imageUrl,
    imageAlt: item.title,
    pressName: item.press?.name,
    reporterName: item.reporterName,
    title: item.title,
    viewCount: item.viewCount,
  };
}

function getBreakingTimestamp(article: HomeArticle) {
  const timestamp = Date.parse(article.dateTime ?? "");

  return Number.isFinite(timestamp) ? timestamp : 0;
}

function getBreakingDateId(updatedAt: string) {
  return updatedAt.replace(/\D/g, "").slice(0, 14) || "unknown";
}

function getBreakingNewsItems(articles: HomeArticle[]) {
  return [...articles]
    .sort((current, next) => getBreakingTimestamp(next) - getBreakingTimestamp(current))
    .map<BreakingNewsItem>((article, index) => {
      const updatedAt = article.dateTime ?? defaultNewsDateTime;

      return {
        article,
        id: `all-breaking-news-${getBreakingDateId(updatedAt)}-${article.id ?? index}`,
        title: article.title,
        updatedAt,
      };
    });
}

function getLatestBreakingNewsItem(articles: HomeArticle[]) {
  return getBreakingNewsItems(articles)[0] ?? null;
}

function normalizeBlockedKeyword(value: string) {
  return value.trim().toLocaleLowerCase("ko-KR");
}

function getArticleFilterText(article: HomeArticle) {
  return [
    article.title,
    article.body,
    article.category,
    article.pressName,
    article.reporterName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("ko-KR");
}

function filterArticlesByBlockedKeywords(
  articles: HomeArticle[],
  blockedKeywords: string[],
) {
  const keywords = blockedKeywords.map(normalizeBlockedKeyword).filter(Boolean);

  if (keywords.length === 0) {
    return articles;
  }

  return articles.filter((article) => {
    const articleText = getArticleFilterText(article);

    return !keywords.some((keyword) => articleText.includes(keyword));
  });
}

const homeArticle: HomeArticle = {
  category: "정치",
  date: "2026년 12월 31일 08:30",
  image: articleImage,
  imageAlt: "아파트 단지 전경",
  title: "용인 수지, 강남·분당 가격 동조화로 15억 시대 진입",
};

const homeArticles: HomeArticle[] = [
  {
    ...homeArticle,
    guideKind: "stacked",
  },
  {
    category: "경제",
    date: "2026년 12월 31일 09:10",
    guideKind: "binary",
    image: articleImage,
    imageAlt: "도심 아파트 단지 전경",
    title: "대출 규제 이후 서울 외곽 거래량 다시 줄었다",
  },
  {
    category: "사회",
    date: "2026년 12월 31일 10:20",
    guideKind: "stacked",
    image: articleImage,
    imageAlt: "아침 햇살이 비치는 주거 단지",
    title: "청년 월세 지원 확대 논의, 지자체별 신청 조건 달라",
  },
  {
    category: "정책",
    date: "2026년 12월 31일 11:35",
    guideKind: "binary",
    image: articleImage,
    imageAlt: "신축 공동주택 단지",
    title: "주택시장 안정 대책 발표 앞두고 실수요자 관망세",
  },
  {
    category: "지역",
    date: "2026년 12월 31일 13:00",
    guideKind: "stacked",
    image: articleImage,
    imageAlt: "수도권 아파트 단지",
    title: "수도권 남부 교통 호재 지역, 매수 문의만 소폭 증가",
  },
  {
    category: "복지",
    date: "2026년 12월 31일 14:25",
    guideKind: "binary",
    image: articleImage,
    imageAlt: "주거지와 상가가 함께 보이는 단지",
    title: "신혼부부 주거비 지원 기준 완화 여부 다음 달 결정",
  },
  {
    category: "문화",
    date: "2026년 12월 31일 15:40",
    guideKind: "stacked",
    image: articleImage,
    imageAlt: "도심 주거 단지와 하늘",
    title: "동네 생활권 문화시설 확충, 주민 체감도 조사 시작",
  },
];

const homeBreakingTitle =
  "정청래, ‘필버 중단’ 국민의 힘에 “대구/경북 통합 찬반 당론 먼저 정하라”";

const navItems: { icon: IconName; label: string; tab: Tab }[] = [
  { icon: "home", label: "메인화면", tab: "home" },
  { icon: "allNews", label: "전체 뉴스", tab: "all" },
  { icon: "policy", label: "국가정책", tab: "policy" },
  { icon: "myPage", label: "마이페이지", tab: "my" },
  { icon: "information", label: "인포메이션", tab: "info" },
];

const baseNoticeItems = [
  {
    date: "2026.12.31",
    title: "NewsRoll 맞춤 알림 설정이 개선되었습니다.",
  },
  {
    date: "2026.12.30",
    title: "개인정보 처리방침 개정 안내",
  },
];

const noticeItems = Array.from({ length: 10 }, (_, index) => ({
  ...baseNoticeItems[index % baseNoticeItems.length],
  date: `2026.12.${String(31 - index).padStart(2, "0")}`,
}));

const infoTabs: { id: InfoTab; label: string }[] = [
  { id: "notice", label: "공지사항" },
  { id: "faq", label: "FAQ" },
  { id: "inquiry", label: "1:1 문의" },
];

const faqItems = [
  {
    answer:
      "동아리 활동에 필요한 강사비, 교재비, 재료비 등 운영비 지원 (팀당 약 150만원).",
    question: "어쩌구 저쩌구 궁금합니다?",
  },
  {
    answer:
      "동아리 활동에 필요한 강사비, 교재비, 재료비 등 운영비 지원 (팀당 약 150만원).",
    question: "어쩌구 저쩌구 궁금합니다?",
  },
  {
    answer:
      "동아리 활동에 필요한 강사비, 교재비, 재료비 등 운영비 지원 (팀당 약 150만원).",
    question: "어쩌구 저쩌구 궁금합니다?",
  },
  {
    answer:
      "동아리 활동에 필요한 강사비, 교재비, 재료비 등 운영비 지원 (팀당 약 150만원).",
    question: "어쩌구 저쩌구 궁금합니다?",
  },
  {
    answer:
      "동아리 활동에 필요한 강사비, 교재비, 재료비 등 운영비 지원 (팀당 약 150만원).",
    question: "어쩌구 저쩌구 궁금합니다?",
  },
  {
    answer:
      "동아리 활동에 필요한 강사비, 교재비, 재료비 등 운영비 지원 (팀당 약 150만원).",
    question: "어쩌구 저쩌구 궁금합니다?",
  },
  {
    answer:
      "동아리 활동에 필요한 강사비, 교재비, 재료비 등 운영비 지원 (팀당 약 150만원).",
    question: "어쩌구 저쩌구 궁금합니다?",
  },
  {
    answer:
      "동아리 활동에 필요한 강사비, 교재비, 재료비 등 운영비 지원 (팀당 약 150만원).",
    question: "어쩌구 저쩌구 궁금합니다?",
  },
];

const inquiryTypes = ["서비스 이용", "뉴스 제보", "계정 문의", "오류 신고"];

const articleBody = `최근 국내 부동산 시장이 다시 한번 변곡점에 서고 있다. 상반기 동안 이어졌던 거래 회복 흐름이 둔화되며, 시장 전반에 신중한 분위기가 확산되는 모습이다.

특히 수도권과 일부 광역시를 중심으로 매수 심리가 빠르게 식고 있다. 한국부동산연구원이 발표한 자료에 따르면, 기준금리 유지에도 불구하고 주택담보대출 심사 강화와 보유세 부담이 실수요자와 투자자 모두에게 압박으로 작용하고 있다.

전문가들은 당분간 가격 급등이나 급락보다는 지역별 양극화가 심화될 가능성에 주목한다. 정책 변화와 금리 방향성이 명확해지기 전까지는 관망세가 이어질 것이며, 안정적인 실거주 중심의 시장 재편이 예상된다.`;

const guideOptions = [
  "어쩌구 저쩌구해서 어케 해야한다.",
  "상황을 더 지켜본 뒤 판단해야 한다.",
  "정책 지원을 먼저 확대해야 한다.",
];

const articleGuideQuestion =
  "예시텍스트 어쩌구랑 어쩌구랑 비교했을때 어케하는게 좋을까?";

const binaryGuideOptions = ["그렇다", "아니다"];

const reactionItems: {
  icon: IconName;
  label: string;
  value: ReactionValue;
}[] = [
  { icon: "thumbUp", label: "좋아요", value: "like" },
  { icon: "thumbDown", label: "싫어요", value: "dislike" },
  { icon: "dots", label: "글쎄요", value: "neutral" },
];

const emptyArticleReactionCounts: Record<ReactionValue, number> = {
  dislike: 0,
  like: 0,
  neutral: 0,
};

const emptyCommentReactionCounts: Record<CommentReactionValue, number> = {
  dislike: 0,
  like: 0,
};

function getVisibleReactionCount(count: number) {
  return count > 0 ? count : null;
}

function getArticleReactionCounts(
  reactions: { type: ReactionValue }[],
): Record<ReactionValue, number> {
  return reactions.reduce<Record<ReactionValue, number>>(
    (counts, reaction) => ({
      ...counts,
      [reaction.type]: counts[reaction.type] + 1,
    }),
    { ...emptyArticleReactionCounts },
  );
}

const commentBodies = [
  "예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트...",
  "예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트...",
  "예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트...",
];

const commentTemplates: Omit<CommentItem, "choice">[] = [
  {
    author: "콩콩이",
    body: commentBodies[0],
    date: "2026.12.31 08:30",
    dislikes: 0,
    id: "template-comment-1",
    likes: 0,
    replies: 13,
  },
  {
    author: "콩콩이",
    body: commentBodies[1],
    date: "2026.12.31 08:30",
    dislikes: 0,
    id: "template-comment-2",
    likes: 0,
    replies: 13,
  },
  {
    author: "콩콩이",
    body: commentBodies[2],
    date: "2026.12.31 08:30",
    dislikes: 0,
    id: "template-comment-3",
    likes: 0,
    replies: 13,
  },
];

const commentReplyTemplates = [
  {
    author: "콩콩이",
    body: "예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트~~",
    choice: "아모른직다",
    date: "2026.12.31 08:30",
    dislikes: 0,
    isMine: true,
    likes: 0,
  },
  {
    author: "콩콩이",
    body: "예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트~~",
    choice: "아모른직다",
    date: "2026.12.31 08:30",
    dislikes: 0,
    likes: 0,
  },
];

type CommentReplyItem = (typeof commentReplyTemplates)[number] & {
  id: string;
  isMine?: boolean;
};

const commentSortOptions: { label: string; value: CommentSortOrder }[] = [
  { label: "인기순", value: "popular" },
  { label: "최신순", value: "latest" },
];

const myCommentActionOptions: { label: string; value: CommentAction }[] = [
  { label: "수정", value: "edit" },
  { label: "삭제", value: "delete" },
];

const otherCommentActionOptions: { label: string; value: CommentAction }[] = [
  { label: "신고", value: "report" },
  { label: "차단", value: "block" },
  { label: "숨김", value: "hide" },
];

function formatCommentDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getCommentAuthor(userId: string) {
  return userId === mockCurrentUserId ? "콩콩이" : "홍길동";
}

function getCommentChoice(
  comment: Comment,
  guideChoices: string[],
  pollOptionLabelById: Record<string, string>,
) {
  if (comment.pollOptionId && pollOptionLabelById[comment.pollOptionId]) {
    return pollOptionLabelById[comment.pollOptionId];
  }

  return guideChoices[0] ?? "전체";
}

function getCommentItemFromApi(
  comment: Comment,
  guideChoices: string[],
  pollOptionLabelById: Record<string, string>,
  replyCount: number,
): CommentItem {
  return {
    author: getCommentAuthor(comment.userId),
    body: comment.content,
    choice: getCommentChoice(comment, guideChoices, pollOptionLabelById),
    createdAt: comment.createdAt,
    date: formatCommentDate(comment.createdAt),
    dislikes: comment.dislikeCount,
    id: comment.id,
    isMine: comment.userId === mockCurrentUserId,
    likes: comment.likeCount,
    replies: replyCount,
  };
}

const allNewsAssets = {
  latest: articleImage,
  relayOne: articleImage,
  relayTwo: articleImage,
  relayThree: articleImage,
  relayFour: articleImage,
  relayFive: articleImage,
  thumbnail: articleImage,
};

const allNewsBreaking = [
  "정청래, ‘필버 중단’ 국민의 힘에 “대구/경북 통합 찬반 당론 먼저 정하라”",
  "류지현호, 대만에 4-5 충격패... WVC ‘빨간불’",
  "대통령, 9일 중동 상황 경제/물가 비상 경제점검회의 주재",
  "여야, 민생 법안 처리 일정 두고 원내대표 회동",
  "정부, 수도권 주택 공급 추가 대책 이번 주 발표",
];

const allNewsLatest = [
  {
    category: "정치",
    image: allNewsAssets.latest,
    title: "'APEC, 국익에 도움됐다' 74%… 국힘 지지층도 인정 '50%가 긍정'",
  },
  {
    category: "경제",
    image: allNewsAssets.relayOne,
    title: "수도권 아파트 거래량 회복세, 실수요 중심으로 재편",
  },
  {
    category: "사회",
    image: allNewsAssets.relayTwo,
    title: "청년 주거 지원 확대 논의, 지자체별 신청 조건 달라",
  },
  {
    category: "국제",
    image: allNewsAssets.relayThree,
    title: "중동 긴장 재고조에 원유·물가 변동성 확대 우려",
  },
  {
    category: "문화",
    image: allNewsAssets.relayFour,
    title: "지역 축제 방문객 증가, 골목상권 매출도 동반 상승",
  },
];

const allNewsPresses = ["중앙일보", "국민일보", "한겨레"];
const allNewsDockedScrollSelectors = {
  contentScroller: ".newsroll_all_panelContent",
  immediatePanel: ".newsroll_all_latest_panel",
  latestScroller: ".newsroll_all_latest_scroller",
  panel: ".newsroll_all_panel",
};
const allNewsSwipeAxisThresholdPx = 8;
type SwipeAxis = "horizontal" | "vertical";

const allNewsHeadlinesByPress: Record<
  string,
  { image: string; title: string }[]
> = {
  국민일보: Array.from({ length: 8 }, (_, index) => ({
    image: [
      allNewsAssets.thumbnail,
      allNewsAssets.relayOne,
      allNewsAssets.relayTwo,
    ][index % 3],
    title:
      index % 2 === 0
        ? "용인 수지, 강남·분당 가격 동조화로 15억 시대 진입"
        : "대출 규제 강화 이후 실수요자 관망세 뚜렷",
  })),
  중앙일보: Array.from({ length: 8 }, (_, index) => ({
    image: [
      allNewsAssets.latest,
      allNewsAssets.relayThree,
      allNewsAssets.relayFour,
    ][index % 3],
    title:
      index % 2 === 0
        ? "'APEC, 국익에 도움됐다' 74%… 국힘 지지층도 인정"
        : "여야, 예산안 세부 쟁점 두고 막판 협상",
  })),
  한겨레: Array.from({ length: 8 }, (_, index) => ({
    image: [
      allNewsAssets.relayFive,
      allNewsAssets.relayTwo,
      allNewsAssets.thumbnail,
    ][index % 3],
    title:
      index % 2 === 0
        ? "청년 주거 정책, 신청 문턱 낮춰야 한다는 지적"
        : "지역 의료 공백 해소 위한 공공지원 논의 확대",
  })),
};

const allNewsRelayCategories = ["정치", "경제", "사회", "문화", "국제"];

const allNewsRelayByCategory: Record<
  string,
  { image: string; title: string }[]
> = Object.fromEntries(
  allNewsRelayCategories.map((category, categoryIndex) => [
    category,
    Array.from({ length: 7 }, (_, index) => ({
      image: [
        allNewsAssets.relayOne,
        allNewsAssets.relayTwo,
        allNewsAssets.relayThree,
        allNewsAssets.relayFour,
        allNewsAssets.relayFive,
      ][(index + categoryIndex) % 5],
      title:
        category === "정치"
          ? index % 2 === 0
            ? "용인 수지, 강남·분당 가격 동조화로 15억 시대 진입"
            : "여야, 민생 법안 처리 두고 본회의 일정 조율"
          : `${category} 주요 이슈 ${index + 1}, 오늘의 흐름을 한눈에 정리`,
    })),
  ]),
);

function NewsToolbar({
  isTextLarge,
  onOpenMenu,
  onOpenSearch,
  showSearch = true,
  onToggleTextSize,
}: {
  isTextLarge: boolean;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  showSearch?: boolean;
  onToggleTextSize: () => void;
}) {
  return (
    <div className="newsroll_toolbar" aria-label="상단 도구">
      <Button
        aria-label="글자 크기"
        aria-pressed={isTextLarge}
        classNameOnly
        className="newsroll_text_size_button"
        onClick={onToggleTextSize}
        size="medium"
        variant="filled"
      >
        <Icon name="sizeIncrease" />
      </Button>
      {showSearch ? (
        <IconButton
          baseClassName="newsroll_toolbar_icon"
          icon="search"
          label="검색"
          onClick={onOpenSearch}
        />
      ) : null}
      <IconButton
        baseClassName="newsroll_toolbar_icon"
        icon="menu"
        label="메뉴"
        onClick={onOpenMenu}
      />
    </div>
  );
}

function QuickMenuDrawer({
  isOpen,
  isDarkMode,
  onClose,
  onNavigate,
}: {
  isOpen: boolean;
  isDarkMode: boolean;
  onClose: () => void;
  onNavigate: (target: QuickMenuTarget) => void;
}) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function closeOnEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const quickMenuItems: Array<{ label: string; target: QuickMenuTarget }> = [
    { label: "내 정보 수정", target: "profileSettings" },
    { label: "맞춤형 뉴스 설정", target: "customNewsSettings" },
    { label: "알림 설정", target: "notificationSettings" },
  ];

  return (
    <ClientPortal>
      <div
        className={`container_quickMenuOverlay${isDarkMode ? " newsroll_dark" : ""}`}
        onClick={onClose}
        role="presentation"
      >
        <section
          aria-label="퀵메뉴"
          aria-modal="true"
          className="container_quickMenuDrawer"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
        >
          <div className="wrapper_quickMenuList">
            {quickMenuItems.map((item, index) => (
              <Fragment key={item.target}>
                {index > 0 ? <NewsRollDivider className="divider_mySection" /> : null}
                <button
                  className="btn_quickMenuItem"
                  onClick={() => onNavigate(item.target)}
                  type="button"
                >
                  <span className="text_mySettingLabel">{item.label}</span>
                  <span className="icon_myChevron" aria-hidden="true" />
                </button>
              </Fragment>
            ))}
          </div>
          <button className="btn_quickMenuLogout" type="button">
            로그아웃
          </button>
        </section>
      </div>
    </ClientPortal>
  );
}

function NewsViewCount({
  className = "newsroll_viewCount",
  count = 132,
}: {
  className?: string;
  count?: number;
}) {
  return (
    <span className={className} aria-label="조회수">
      <i className="newsroll_all_stat_icon_eye" aria-hidden="true" />
      {count.toLocaleString("ko-KR")}
    </span>
  );
}

function HomeArticleMeta({
  className = "newsroll_article_meta",
  date,
  dateTime = defaultNewsDateTime,
  showViewCount = true,
  viewCount,
}: {
  className?: string;
  date: string;
  dateTime?: string;
  showViewCount?: boolean;
  viewCount?: number;
}) {
  return (
    <p className={className}>
      <NewsCreatedTime dateTime={dateTime}>{date}</NewsCreatedTime>
      {showViewCount ? <NewsViewCount count={viewCount} /> : null}
    </p>
  );
}

function HomeMainHeader({
  breakingItem = null,
  breakingTitle = homeBreakingTitle,
  dockedControlsMotionClassName = "",
  isDetailOpen = false,
  isTextLarge,
  mode,
  newsCount,
  onCloseDetail,
  onOpenBreakingArticle,
  onModeChange,
  onOpenBreakingNews,
  onOpenMenu,
  onOpenSearch,
  onToggleTextSize,
}: HomeHeaderControls) {
  return (
      <NewsRollSummaryHeroTop
        footer={
          <div className="wrapper_breakingNews">
            <BreakingNewsCardLink
              href={breakingItem ? `#${breakingItem.id}` : "#all-breaking-news"}
              id={breakingItem ? `home-${breakingItem.id}` : undefined}
              onClick={(event) => {
                event.preventDefault();
                if (breakingItem && onOpenBreakingArticle) {
                  onOpenBreakingArticle(breakingItem.article);
                  return;
                }

                onOpenBreakingNews();
              }}
              showIcon
              title={breakingTitle}
              updatedAt={breakingItem?.updatedAt}
              variant="home"
            />
          </div>
        }
        toolbar={
          <NewsToolbar
            isTextLarge={isTextLarge}
            onOpenMenu={onOpenMenu}
            onOpenSearch={onOpenSearch}
            onToggleTextSize={onToggleTextSize}
          />
        }
        hero={{
          ariaLabel: "홈 요약",
          caption: "새로운 소식이 있습니다.",
          controls: (
            <NewsRollDockedControls
              className={`newsroll_motion_dockedPop newsroll_homeDockedMotion ${dockedControlsMotionClassName}`.trim()}
              isDetailOpen={isDetailOpen}
            >
              {isDetailOpen ? (
                <NewsRollDetailBackButton
                  ariaLabel="블록형 뉴스 목록으로 돌아가기"
                  onClick={onCloseDetail}
                />
              ) : (
                <NewsViewToggle mode={mode} onModeChange={onModeChange} />
              )}
              <Button
                aria-label="알림"
                aria-pressed={false}
                className="newsroll_homeDockedAlarm"
                iconOnly
                onClick={onOpenBreakingNews}
                radius="full"
                size="large"
                variant="outline"
              >
                <Icon name="alarm" />
              </Button>
            </NewsRollDockedControls>
          ),
          count: formatHeroCount(newsCount),
          greeting: (
            <>
              반갑습니다 <strong>콩콩이</strong>님!
            </>
          ),
          unit: "개",
        }}
      />
  );
}

function HomeShell({
  breakingItem,
  breakingTitle,
  children,
  isDetailOpen = false,
  isTextLarge,
  mode,
  newsCount,
  onCloseDetail,
  onOpenBreakingArticle,
  onModeChange,
  onOpenBreakingNews,
  onOpenMenu,
  onOpenSearch,
  onToggleTextSize,
}: HomeHeaderControls & { children: ReactNode }) {
  const screenRef = useRef<HTMLElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLElement | null>(null);
  const previousModeRef = useRef(mode);
  const [dockedControlsMotionClassName, setDockedControlsMotionClassName] =
    useState("");
  const dockedControlsMotionClassRef = useRef("");
  const dockedPanelScroll = useDockedPanelScroll({
    boundaryDelayMs: nextArticleRevealDelayMs,
    contentScrollerSelector: homeDockedScrollSelectors.contentScroller,
    dockedClassName: "is_homeSheetDocked",
    panelSelector: homeDockedScrollSelectors.panel,
    rootRef: screenRef,
    scrollerRef,
  });

  const handleSheetScroll = () => {
    dockedPanelScroll.storeScrollTop();
  };

  useEffect(() => {
    const screen = screenRef.current;

    if (!screen) {
      return;
    }

    const setMotionClass = (nextClassName: string) => {
      dockedControlsMotionClassRef.current = nextClassName;
      setDockedControlsMotionClassName(nextClassName);
    };
    const syncMotionState = () => {
      const isDocked = screen.classList.contains("is_homeSheetDocked");

      if (isDocked) {
        setMotionClass("is_motionVisible");
        return;
      }

      setMotionClass("");
    };
    const observer = new MutationObserver(syncMotionState);

    syncMotionState();
    observer.observe(screen, {
      attributeFilter: ["class"],
      attributes: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    const nextScroller =
      sheetRef.current?.querySelector<HTMLElement>(homeSheetScrollSelector) ??
      null;
    const didModeChange = previousModeRef.current !== mode;

    scrollerRef.current = nextScroller;
    if (nextScroller) {
      if (didModeChange) {
        dockedPanelScroll.resetScroll(nextScroller);
      } else if (screenRef.current?.classList.contains("is_homeSheetDocked")) {
        dockedPanelScroll.restoreScrollTop(nextScroller);
      } else {
        nextScroller.scrollTop = 0;
      }
    }
    previousModeRef.current = mode;
  }, [children, mode]);

  return (
    <NewsRollCommonLayout
      aria-label="메인 뉴스"
      className="container_homeScreen"
      dockedClassName="is_homeSheetDocked"
      dockedGap={homeSheetDockedGap}
      initialGap={homeSheetInitialGap}
      minInitialTop={pagePanelInitialTop}
      movingSheet
      onTouchMoveCapture={dockedPanelScroll.handleTouchMove}
      onTouchStartCapture={dockedPanelScroll.handleTouchStart}
      onWheelCapture={dockedPanelScroll.handleWheel}
      ref={screenRef}
      sheetClassName="container_homeSheet"
      sheetNestedScrollResetSelector={homeDockedScrollSelectors.contentScroller}
      sheetProps={{ onScrollCapture: handleSheetScroll }}
      sheetRef={sheetRef}
      sheetScrollSelector={homeSheetScrollSelector}
      top={
        <HomeMainHeader
          breakingItem={breakingItem}
          breakingTitle={breakingTitle}
          isDetailOpen={isDetailOpen}
          isTextLarge={isTextLarge}
          dockedControlsMotionClassName={dockedControlsMotionClassName}
          mode={mode}
          newsCount={newsCount}
          onCloseDetail={onCloseDetail}
          onOpenBreakingArticle={onOpenBreakingArticle}
          onModeChange={onModeChange}
          onOpenBreakingNews={onOpenBreakingNews}
          onOpenMenu={onOpenMenu}
          onOpenSearch={onOpenSearch}
          onToggleTextSize={onToggleTextSize}
        />
      }
    >
      {children}
    </NewsRollCommonLayout>
  );
}

function ReactionControls({
  className = "",
  counts,
  reaction,
  onReactionChange,
}: {
  className?: string;
  counts: Record<ReactionValue, number>;
  reaction: Reaction;
  onReactionChange: (reaction: Reaction) => void;
}) {
  return (
    <div
      className={`wrapper_articleReaction ${className}`.trim()}
      aria-label="기사 평가"
      role="group"
    >
      {reactionItems.map((item) => (
        <ReactionButton
          aria-pressed={reaction === item.value}
          icon={item.icon}
          key={item.value}
          onClick={() =>
            onReactionChange(reaction === item.value ? null : item.value)
          }
          tone={item.value}
          variant="article"
        >
          <strong>
            {item.label}
            {getVisibleReactionCount(counts[item.value]) == null
              ? ""
              : ` ${counts[item.value]}`}
          </strong>
        </ReactionButton>
      ))}
    </div>
  );
}

function getVotePercentages(voteCounts: number[]) {
  const totalVotes = voteCounts.reduce((sum, count) => sum + count, 0);

  if (totalVotes === 0) {
    return voteCounts.map(() => 0);
  }

  const rawPercentages = voteCounts.map((count) => (count / totalVotes) * 100);
  const percentages = rawPercentages.map(Math.floor);
  let remainder = 100 - percentages.reduce((sum, percent) => sum + percent, 0);
  const remainderOrder = rawPercentages
    .map((percent, index) => ({
      index,
      remainder: percent - Math.floor(percent),
    }))
    .sort((a, b) => b.remainder - a.remainder);

  for (let index = 0; index < remainder; index += 1) {
    percentages[remainderOrder[index % remainderOrder.length].index] += 1;
  }

  return percentages;
}

type ArticleGuideOptionButtonProps = {
  isSelected: boolean;
  label: string;
  onClick?: () => void;
  percent?: number;
  showResult?: boolean;
  variant?: GuideKind;
};

function ArticleGuideOptionButton({
  isSelected,
  label,
  onClick,
  percent = 0,
  showResult = false,
  variant = "stacked",
}: ArticleGuideOptionButtonProps) {
  const isBinary = variant === "binary";
  const binaryTone =
    isBinary && label === binaryGuideOptions[0]
      ? "yes"
      : isBinary
        ? "no"
        : undefined;
  const fillStyle = showResult
    ? ({ "--article-guide-result-size": `${percent}%` } as CSSProperties)
    : undefined;

  return (
    <button
      aria-pressed={isSelected}
      className={`btn_articleGuideOption btn_articleGuideOption_${variant}`}
      data-binary-tone={binaryTone}
      data-result-visible={showResult ? "true" : undefined}
      onClick={onClick}
      style={fillStyle}
      type="button"
    >
      {isBinary ? (
        <img
          alt=""
          className="img_articleGuideBinaryIcon"
          src={label === binaryGuideOptions[0] ? "/icons/icon_yes.svg" : "/icons/icon_no.svg"}
        />
      ) : null}
      <span className="text_articleGuideOption">{label}</span>
      {showResult ? (
        <strong className="text_articleGuidePercent">{percent}%</strong>
      ) : null}
    </button>
  );
}

function ArticleGuideSection({
  id,
  kind,
  newsId,
}: {
  id?: string;
  kind: GuideKind;
  newsId?: string;
}) {
  const [selectedGuideOption, setSelectedGuideOption] = useState<number | null>(
    null,
  );
  const [currentPollVoteId, setCurrentPollVoteId] = useState<string | null>(null);
  const fallbackOptions = useMemo(
    () => (kind === "binary" ? binaryGuideOptions : guideOptions),
    [kind],
  );
  const [pollDetail, setPollDetail] = useState<Awaited<ReturnType<typeof pollApi.getPoll>>>(null);
  const options =
    pollDetail?.options.map((option) => option.label) ?? fallbackOptions;
  const [voteCounts, setVoteCounts] = useState(() => options.map(() => 0));
  const totalVotes = voteCounts.reduce((sum, count) => sum + count, 0);
  const percentages = getVotePercentages(voteCounts);
  const hasVoted = selectedGuideOption !== null;

  useEffect(() => {
    let ignore = false;

    async function loadPoll() {
      if (!newsId) {
        setPollDetail(null);
        setSelectedGuideOption(null);
        setCurrentPollVoteId(null);
        setVoteCounts(fallbackOptions.map(() => 0));
        return;
      }

      const nextPoll = await pollApi.getPoll(newsId);

      if (ignore) {
        return;
      }

      setPollDetail(nextPoll);
      const nextOptions = nextPoll?.options ?? [];
      const nextCounts =
        nextOptions.length > 0
          ? nextOptions.map(
              (option) =>
                nextPoll?.votes.filter((vote) => vote.pollOptionId === option.id)
                  .length ?? 0,
            )
          : fallbackOptions.map(() => 0);
      const currentVoteIndex = nextPoll?.currentUserVote
        ? nextOptions.findIndex(
            (option) => option.id === nextPoll.currentUserVote?.pollOptionId,
          )
        : -1;

      setVoteCounts(nextCounts);
      setSelectedGuideOption(currentVoteIndex >= 0 ? currentVoteIndex : null);
      setCurrentPollVoteId(nextPoll?.currentUserVote?.id ?? null);
    }

    loadPoll().catch(() => {
      if (!ignore) {
        setPollDetail(null);
        setSelectedGuideOption(null);
        setCurrentPollVoteId(null);
        setVoteCounts(fallbackOptions.map(() => 0));
      }
    });

    return () => {
      ignore = true;
    };
  }, [fallbackOptions, newsId]);

  async function vote(index: number) {
    if (selectedGuideOption === index) {
      setSelectedGuideOption(null);
      setVoteCounts((currentCounts) =>
        currentCounts.map((count, countIndex) =>
          countIndex === index ? Math.max(0, count - 1) : count,
        ),
      );

      if (currentPollVoteId) {
        const voteId = currentPollVoteId;

        setCurrentPollVoteId(null);
        await pollApi.removePollVote(voteId);
      }

      return;
    }

    let nextPollDetail = pollDetail;
    let option = nextPollDetail?.options[index];

    const previousSelectedIndex = selectedGuideOption;

    setSelectedGuideOption(index);
    setVoteCounts((currentCounts) =>
      currentCounts.map((count, countIndex) =>
        countIndex === index
          ? count + 1
          : countIndex === previousSelectedIndex
            ? Math.max(0, count - 1)
            : count,
      ),
    );

    if (!nextPollDetail && newsId) {
      nextPollDetail = await pollApi.createPoll({
        newsId,
        options: fallbackOptions,
        title: articleGuideQuestion,
      });
      option = nextPollDetail.options[index];
      setPollDetail(nextPollDetail);
    }

    if (nextPollDetail && option) {
      if (currentPollVoteId) {
        await pollApi.updatePollVote(currentPollVoteId, option.id);
        return;
      }

      const nextVote = await pollApi.submitPollVote({
          pollId: nextPollDetail.id,
          pollOptionId: option.id,
          userId: mockCurrentUserId,
        });
      setCurrentPollVoteId(nextVote.id);
    }
  }

  return (
    <section
      className={`wrapper_articleGuide wrapper_articleGuide_${kind}`}
      id={id}
      aria-label="안내 문구"
    >
      <h2 className="text_articleGuide">
        {articleGuideQuestion}
      </h2>
      <div className="wrapper_articleGuideOptions">
        {options.map((option, index) => {
          const percent = percentages[index];
          const isBinary = kind === "binary";

          return (
            <ArticleGuideOptionButton
              isSelected={selectedGuideOption === index}
              key={option}
              label={option}
              onClick={() => vote(index)}
              percent={percent}
              showResult={hasVoted}
              variant={kind}
            />
          );
        })}
      </div>
      <p className="text_articleGuideTotal">
        <strong>{totalVotes}명</strong>이 참여했어요.
      </p>
    </section>
  );
}

function CommentInlineEditor({
  ariaLabel,
  onCancel,
  onChange,
  onSave,
  value,
}: {
  ariaLabel: string;
  onCancel: () => void;
  onChange: (value: string) => void;
  onSave: () => void;
  value: string;
}) {
  return (
    <div className="wrapper_commentEdit">
      <Textarea
        aria-label={ariaLabel}
        className="textarea_commentEdit"
        onChange={(event) => onChange(event.target.value)}
        radius="rounded"
        rows={4}
        textareaSize="large"
        value={value}
      />
      <div className="wrapper_commentEditActions">
        <Button
          className="btn_commentEditSave"
          onClick={onSave}
          radius="rounded"
          size="large"
          type="button"
          variant="filled"
        >
          저장
        </Button>
        <Button
          className="btn_commentEditCancel"
          onClick={onCancel}
          radius="rounded"
          size="large"
          type="button"
          variant="filled"
        >
          취소
        </Button>
      </div>
    </div>
  );
}

function CommentReactionPanel({
  guideKind,
  id,
  initialCommentId,
  initialReplyTargetId,
  newsId,
}: {
  guideKind: GuideKind;
  id?: string;
  initialCommentId?: CommentId;
  initialReplyTargetId?: CommentId;
  newsId?: string;
}) {
  const guideChoices =
    guideKind === "binary" ? binaryGuideOptions : guideOptions;
  const panelId = id ?? "home-comment-panel";
  const composerId = `${panelId}-composer`;
  const commentSortMenuId = `${panelId}-sort-menu`;
  const panelRef = useRef<HTMLElement | null>(null);
  const commentTabs = useMemo(
    () => [
      { id: "all", label: "전체" },
      ...guideChoices.map((choice) => ({ id: choice, label: choice })),
    ],
    [guideChoices],
  );
  const [activeChoice, setActiveChoice] = useState(commentTabs[0].id);
  const [composerDraft, setComposerDraft] = useState("");
  const [composerMode, setComposerMode] = useState<"comment" | "reply">(
    "comment",
  );
  const [commentReactions, setCommentReactions] = useState<
    Record<CommentId, CommentReactionValue | null>
  >({});
  const [commentReactionRows, setCommentReactionRows] = useState<
    Record<CommentId, CommentReaction>
  >({});
  const [commentReactionCounts, setCommentReactionCounts] = useState<
    Record<CommentId, Record<CommentReactionValue, number>>
  >({});
  const [commentLoadFailed, setCommentLoadFailed] = useState(false);
  const [apiComments, setApiComments] = useState<Comment[]>([]);
  const [pollOptionLabelById, setPollOptionLabelById] = useState<Record<string, string>>({});
  const [deletedCommentIds, setDeletedCommentIds] = useState<CommentId[]>([]);
  const [deletedReplyIds, setDeletedReplyIds] = useState<string[]>([]);
  const [expandedReplyId, setExpandedReplyId] = useState<CommentId | null>(
    null,
  );
  const [isComposerVisible, setIsComposerVisible] = useState(false);
  const [composerHeight, setComposerHeight] = useState(0);
  const [myCommentsOnly, setMyCommentsOnly] = useState(false);
  const [isCommentSortOpen, setIsCommentSortOpen] = useState(false);
  const [openCommentActionId, setOpenCommentActionId] =
    useState<CommentId | null>(null);
  const [openReplyActionId, setOpenReplyActionId] = useState<string | null>(
    null,
  );
  const [replyTargetCommentId, setReplyTargetCommentId] = useState<
    CommentId | null
  >(null);
  const [sortOrder, setSortOrder] = useState<CommentSortOrder>("popular");
  const [pendingScrollTarget, setPendingScrollTarget] =
    useState<CommentScrollTarget | null>(null);
  const commentEdit = useInlineTextEdit<CommentId>();
  const replyEdit = useInlineTextEdit<string>();
  const initialCommentScrollKeyRef = useRef<string | null>(null);
  const initialCommentTargetId =
    initialCommentId != null || initialReplyTargetId != null
      ? `${panelId}-comment-${initialCommentId ?? initialReplyTargetId}`
      : null;
  const initialCommentScrollKey =
    initialCommentTargetId != null
      ? `${newsId ?? ""}:${initialCommentTargetId}`
      : null;
  const commentListStyle = {
    "--newsroll-comment-composer-height": isComposerVisible
      ? `${composerHeight}px`
      : "0px",
  } as CSSProperties;
  const commentListId = `${panelId}-comment-list`;
  const prepareInitialCommentScroll = useCallback(() => {
    const targetCommentId = initialReplyTargetId ?? initialCommentId;

    if (targetCommentId == null) {
      return;
    }

    setIsComposerVisible(true);
  }, [initialCommentId, initialReplyTargetId]);
  const deletedCommentIdSet = useMemo(
    () => new Set(deletedCommentIds),
    [deletedCommentIds],
  );
  const deletedReplyIdSet = useMemo(
    () => new Set(deletedReplyIds),
    [deletedReplyIds],
  );
  const commentsByParentId = useMemo(() => {
    const groups: Record<string, Comment[]> = {};

    apiComments.forEach((comment) => {
      if (!comment.parentId) {
        return;
      }

      groups[comment.parentId] = [...(groups[comment.parentId] ?? []), comment];
    });

    return groups;
  }, [apiComments]);
  const allComments = useMemo(
    () =>
      apiComments
        .filter((comment) => !comment.parentId)
        .map((comment) =>
          getCommentItemFromApi(
            comment,
            guideChoices,
            pollOptionLabelById,
            commentsByParentId[comment.id]?.length ?? 0,
          ),
        )
        .map((comment) => {
          const editedBody = commentEdit.getEditedValue(comment.id);

          return editedBody ? { ...comment, body: editedBody } : comment;
        })
        .filter((comment) => !deletedCommentIdSet.has(comment.id)),
    [
      apiComments,
      commentEdit.editedValues,
      commentsByParentId,
      deletedCommentIdSet,
      guideChoices,
      pollOptionLabelById,
    ],
  );
  const getCommentReactionCounts = (comment: { id: string }) => {
    const counts = commentReactionCounts[comment.id] ?? emptyCommentReactionCounts;

    return {
      dislikes: counts.dislike,
      likes: counts.like,
    };
  };
  const getCommentPopularity = (comment: CommentItem) => {
    const { likes } = getCommentReactionCounts(comment);
    return likes + comment.replies;
  };
  const visibleComments = useMemo(
    () =>
      allComments
        .filter((comment) => (myCommentsOnly ? comment.isMine : true))
        .filter((comment) =>
          activeChoice === "all" ? true : comment.choice === activeChoice,
        )
        .sort((a, b) => {
          if (sortOrder === "latest") {
            return (
              new Date(b.createdAt ?? 0).getTime() -
              new Date(a.createdAt ?? 0).getTime()
            );
          }

          return (
            getCommentPopularity(b) - getCommentPopularity(a) ||
            new Date(b.createdAt ?? 0).getTime() -
              new Date(a.createdAt ?? 0).getTime()
          );
        }),
    [
      activeChoice,
      allComments,
      commentReactionCounts,
      myCommentsOnly,
      sortOrder,
    ],
  );

  function scrollArticleTo(
    articleScroller: HTMLElement,
    nextScrollTop: number,
  ) {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    articleScroller.scrollTop = nextScrollTop;

    if (
      !prefersReducedMotion &&
      typeof articleScroller.scrollTo === "function"
    ) {
      articleScroller.scrollTo({
        behavior: "smooth",
        top: nextScrollTop,
      });
    }
  }

  function getCommentScrollRoot() {
    const panel = panelRef.current;

    if (!panel) {
      return null;
    }

    const candidates = [
      panel.closest(".wrapper_articleCardContent"),
      panel.closest(".newsroll_page_panelContent"),
      panel.closest(".container_newsFeed_detail"),
      panel.closest(".container_newsFeed"),
    ];

    return (
      candidates.find(
        (candidate): candidate is HTMLElement =>
          candidate instanceof HTMLElement &&
          candidate.scrollHeight > candidate.clientHeight,
      ) ??
      candidates.find(
        (candidate): candidate is HTMLElement =>
          candidate instanceof HTMLElement,
      ) ??
      null
    );
  }

  function scrollElementBottomIntoView(targetId: string, bottomGap = 24) {
    const target = document.getElementById(targetId);
    const articleScroller = getCommentScrollRoot();

    if (!(articleScroller instanceof HTMLElement) || !target) {
      return false;
    }

    const scrollerRect = articleScroller.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const composerRect = document
      .getElementById(composerId)
      ?.getBoundingClientRect();
    const visibleBottom = composerRect
      ? Math.min(scrollerRect.bottom, composerRect.top)
      : scrollerRect.bottom;
    const targetScrollTop =
      articleScroller.scrollTop + targetRect.bottom - visibleBottom + bottomGap;
    const nextScrollTop = Math.min(
      Math.max(0, articleScroller.scrollHeight - articleScroller.clientHeight),
      Math.max(0, targetScrollTop),
    );

    scrollArticleTo(articleScroller, nextScrollTop);
    return true;
  }

  function scrollArticleToBottom() {
    const articleScroller = getCommentScrollRoot();

    if (!(articleScroller instanceof HTMLElement)) {
      return;
    }

    scrollArticleTo(
      articleScroller,
      Math.max(0, articleScroller.scrollHeight - articleScroller.clientHeight),
    );
  }

  function scrollPanelTopToReadingPosition() {
    const panel = panelRef.current;
    const articleScroller = getCommentScrollRoot();

    if (!(articleScroller instanceof HTMLElement) || !panel) {
      return;
    }

    const scrollerRect = articleScroller.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const targetScrollTop =
      articleScroller.scrollTop +
      panelRect.top -
      scrollerRect.top -
      articleScroller.clientHeight * 0.3;
    const nextScrollTop = Math.max(0, targetScrollTop);

    scrollArticleTo(articleScroller, nextScrollTop);
    setIsComposerVisible(true);
  }

  const reloadComments = useCallback(async () => {
    if (!newsId) {
      setApiComments([]);
      setCommentReactions({});
      setCommentReactionRows({});
      setCommentReactionCounts({});
      setPollOptionLabelById({});
      setCommentLoadFailed(false);
      return;
    }

    const [nextComments, userReactions, allReactions, pollDetail] = await Promise.all([
      commentApi.getCommentsByNewsId(newsId),
      commentApi.getCommentReactionsByUserId(mockCurrentUserId),
      commentApi.getCommentReactions(),
      pollApi.getPoll(newsId),
    ]);
    const commentIdSet = new Set(nextComments.map((comment) => comment.id));
    const reactionRows = Object.fromEntries(
      userReactions
        .filter((reaction) => commentIdSet.has(reaction.commentId))
        .map((reaction) => [reaction.commentId, reaction]),
    );
    const reactionCounts = allReactions
      .filter((reaction) => commentIdSet.has(reaction.commentId))
      .reduce<Record<CommentId, Record<CommentReactionValue, number>>>(
        (counts, reaction) => {
          const currentCounts = counts[reaction.commentId] ?? {
            ...emptyCommentReactionCounts,
          };

          counts[reaction.commentId] = {
            ...currentCounts,
            [reaction.type]: currentCounts[reaction.type] + 1,
          };

          return counts;
        },
        {},
      );
    const reactionValues = Object.fromEntries(
      Object.entries(reactionRows).map(([commentId, reaction]) => [
        commentId,
        reaction.type,
      ]),
    );

    setApiComments(nextComments);
    setCommentReactionRows(reactionRows);
    setCommentReactionCounts(reactionCounts);
    setCommentReactions(reactionValues);
    setCommentLoadFailed(false);
    setPollOptionLabelById(
      Object.fromEntries(
        pollDetail?.options.map((option) => [option.id, option.label]) ?? [],
      ),
    );
  }, [newsId]);

  useEffect(() => {
    reloadComments().catch(() => {
      setApiComments([]);
      setCommentReactions({});
      setCommentReactionRows({});
      setCommentReactionCounts({});
      setPollOptionLabelById({});
      setCommentLoadFailed(true);
    });
  }, [reloadComments]);

  useEffect(() => {
    function closeCommentDropdowns(event: globalThis.PointerEvent) {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      if (target.closest(".wrapper_commentDropdown, .wrapper_commentAction")) {
        return;
      }

      setIsCommentSortOpen(false);
      setOpenCommentActionId(null);
      setOpenReplyActionId(null);
    }

    function closeCommentDropdownsWithEscape(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      setIsCommentSortOpen(false);
      setOpenCommentActionId(null);
      setOpenReplyActionId(null);
    }

    document.addEventListener("pointerdown", closeCommentDropdowns);
    document.addEventListener("keydown", closeCommentDropdownsWithEscape);

    return () => {
      document.removeEventListener("pointerdown", closeCommentDropdowns);
      document.removeEventListener("keydown", closeCommentDropdownsWithEscape);
    };
  }, []);

  useEffect(() => {
    const panel = panelRef.current;

    if (!panel) {
      return;
    }

    const scrollRoot = panel.closest(".wrapper_articleCardContent");
    const card = scrollRoot?.closest(".container_articleCard");
    const feedScroller = card?.closest(".container_newsFeed");
    const updateComposerVisibility = () => {
      if (!(scrollRoot instanceof HTMLElement)) {
        setIsComposerVisible(false);
        return;
      }

      const panelRect = panel.getBoundingClientRect();
      const rootRect = scrollRoot.getBoundingClientRect();
      const cardRect = card?.getBoundingClientRect();
      const feedRect = feedScroller?.getBoundingClientRect();
      const hasVisibleOverlap =
        panelRect.bottom > rootRect.top && panelRect.top < rootRect.bottom;
      const cardVisibleHeight =
        cardRect && feedRect
          ? Math.min(cardRect.bottom, feedRect.bottom) -
            Math.max(cardRect.top, feedRect.top)
          : rootRect.height;
      const cardVisibleRatio =
        cardRect && cardRect.height > 0
          ? Math.max(0, cardVisibleHeight) / cardRect.height
          : 1;
      const panelTop = scrollRoot.scrollTop + panelRect.top - rootRect.top;
      const panelBottom = panelTop + panelRect.height;
      const viewportCenter =
        scrollRoot.scrollTop + scrollRoot.clientHeight * 0.5;

      setIsComposerVisible(
        cardVisibleRatio >= 0.5 &&
          hasVisibleOverlap
          && viewportCenter >= panelTop
          && viewportCenter <= panelBottom,
      );
    };

    updateComposerVisibility();
    if (scrollRoot instanceof HTMLElement) {
      scrollRoot.addEventListener("scroll", updateComposerVisibility, {
        passive: true,
      });
    }
    if (feedScroller instanceof HTMLElement && feedScroller !== scrollRoot) {
      feedScroller.addEventListener("scroll", updateComposerVisibility, {
        passive: true,
      });
    }
    window.addEventListener("resize", updateComposerVisibility);

    return () => {
      if (scrollRoot instanceof HTMLElement) {
        scrollRoot.removeEventListener("scroll", updateComposerVisibility);
      }
      if (feedScroller instanceof HTMLElement && feedScroller !== scrollRoot) {
        feedScroller.removeEventListener("scroll", updateComposerVisibility);
      }
      window.removeEventListener("resize", updateComposerVisibility);
    };
  }, []);

  useEffect(() => {
    if (initialCommentTargetId == null || initialCommentScrollKey == null) {
      return;
    }

    if (initialCommentScrollKeyRef.current === initialCommentScrollKey) {
      return;
    }

    prepareInitialCommentScroll();

    if (composerHeight <= 0) {
      return;
    }

    let isCancelled = false;
    let retryTimeout = 0;

    const tryScrollToInitialComment = (attempt = 0) => {
      if (isCancelled) {
        return;
      }

      const didScroll = scrollElementBottomIntoView(
        initialCommentTargetId,
        0,
      );

      if (didScroll) {
        initialCommentScrollKeyRef.current = initialCommentScrollKey;
        return;
      }

      if (attempt >= 12) {
        return;
      }

      retryTimeout = window.setTimeout(() => {
        window.requestAnimationFrame(() => {
          tryScrollToInitialComment(attempt + 1);
        });
      }, 80);
    };

    const timeout = window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          tryScrollToInitialComment();
        });
      });
    }, commentScrollDelayMs);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeout);
      window.clearTimeout(retryTimeout);
    };
  }, [
    apiComments.length,
    composerHeight,
    expandedReplyId,
    initialCommentScrollKey,
    initialCommentTargetId,
    prepareInitialCommentScroll,
  ]);

  useEffect(() => {
    if (initialCommentTargetId != null) {
      return;
    }

    const timeout = window.setTimeout(() => {
      scrollPanelTopToReadingPosition();
    }, commentScrollDelayMs);

    return () => window.clearTimeout(timeout);
  }, [initialCommentTargetId]);

  useEffect(() => {
    if (isComposerVisible) {
      return;
    }

    setComposerHeight(0);
    setComposerDraft("");
    setComposerMode("comment");
    commentEdit.cancelEdit();
    replyEdit.cancelEdit();
    setReplyTargetCommentId(null);
  }, [isComposerVisible]);

  useLayoutEffect(() => {
    if (!isComposerVisible) {
      setComposerHeight(0);
      return undefined;
    }

    let animationFrame = 0;

    const measureComposer = () => {
      const composer = document.getElementById(composerId);
      const nextHeight = composer
        ? Math.ceil(composer.getBoundingClientRect().height)
        : 0;

      setComposerHeight((current) =>
        current === nextHeight ? current : nextHeight,
      );
    };

    animationFrame = window.requestAnimationFrame(measureComposer);
    window.addEventListener("resize", measureComposer);

    const composer = document.getElementById(composerId);
    const resizeObserver =
      composer && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(measureComposer)
        : null;

    if (composer && resizeObserver) {
      resizeObserver.observe(composer);
    }

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", measureComposer);
      resizeObserver?.disconnect();
    };
  }, [composerId, isComposerVisible]);

  useEffect(() => {
    if (
      !isComposerVisible ||
      composerHeight <= 0 ||
      initialCommentTargetId != null ||
      visibleComments.length === 0
    ) {
      return;
    }

    const timeout = window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        scrollElementBottomIntoView(commentListId, 0);
      });
    }, commentScrollDelayMs);

    return () => window.clearTimeout(timeout);
  }, [
    commentListId,
    composerHeight,
    initialCommentTargetId,
    isComposerVisible,
    visibleComments.length,
  ]);

  useEffect(() => {
    if (!pendingScrollTarget) {
      return;
    }

    const scrollTarget = pendingScrollTarget;
    const timeout = window.setTimeout(() => {
      if (scrollTarget.stickToBottom) {
        scrollArticleToBottom();
      } else {
        scrollElementBottomIntoView(
          scrollTarget.id,
          scrollTarget.bottomGap,
        );
      }
      setPendingScrollTarget(null);
    }, scrollTarget.delayMs ?? commentScrollDelayMs);

    return () => window.clearTimeout(timeout);
  }, [pendingScrollTarget]);

  function resetComposer() {
    setComposerDraft("");
    setComposerMode("comment");
    commentEdit.cancelEdit();
    replyEdit.cancelEdit();
    setReplyTargetCommentId(null);
  }

  function startEditComment(commentId: CommentId) {
    const targetComment = allComments.find(
      (comment) => comment.id === commentId && comment.isMine,
    );

    if (!targetComment) {
      return;
    }

    setReplyTargetCommentId(null);
    replyEdit.cancelEdit();
    commentEdit.beginEdit(commentId, targetComment.body);
    setComposerMode("comment");
    setComposerDraft("");
  }

  function cancelEditComment() {
    commentEdit.cancelEdit();
  }

  async function saveEditedComment() {
    const commentId = commentEdit.editingId;
    const content = commentEdit.draft.trim();

    if (!commentId || !content) {
      return;
    }

    await commentApi.updateComment(commentId, { content });
    commentEdit.saveEdit();
    await reloadComments();
  }

  function startEditReply(reply: CommentReplyItem, value: string) {
    if (!reply.isMine) {
      return;
    }

    commentEdit.cancelEdit();
    replyEdit.beginEdit(reply.id, value);
    setComposerMode("comment");
    setComposerDraft("");
  }

  function cancelEditReply() {
    replyEdit.cancelEdit();
  }

  async function saveEditedReply() {
    const replyId = replyEdit.editingId;
    const content = replyEdit.draft.trim();

    if (!replyId || !content) {
      return;
    }

    await commentApi.updateComment(replyId, { content });
    replyEdit.saveEdit();
    await reloadComments();
  }

  function startReplyComposer(commentId: CommentId) {
    if (!isComposerVisible) {
      return;
    }

    commentEdit.cancelEdit();
    replyEdit.cancelEdit();
    setReplyTargetCommentId(commentId);
    setExpandedReplyId(commentId);
    setComposerMode("reply");
    setComposerDraft("");
    setPendingScrollTarget({
      bottomGap: 0,
      delayMs: nextArticleRevealDelayMs,
      id: `${panelId}-reply-list-${commentId}`,
    });
  }

  function toggleReplyList(commentId: CommentId) {
    const isClosing = expandedReplyId === commentId;

    if (!isClosing) {
      setPendingScrollTarget({
        bottomGap: 0,
        delayMs: nextArticleRevealDelayMs,
        id: `${panelId}-reply-list-${commentId}`,
      });
    }

    setExpandedReplyId(isClosing ? null : commentId);

    if (isClosing && replyTargetCommentId === commentId) {
      resetComposer();
    }
  }

  async function submitComposer() {
    const body = composerDraft.trim();

    if (!body || !newsId) {
      return;
    }

    if (composerMode === "reply") {
      const targetComment = allComments.find(
        (comment) => comment.id === replyTargetCommentId,
      );

      if (!targetComment) {
        resetComposer();
        return;
      }

      const createdReply = await commentApi.createComment({
        content: body,
        newsId,
        parentId: targetComment.id,
        userId: mockCurrentUserId,
      });

      setPendingScrollTarget({
        bottomGap: 0,
        id: `${panelId}-reply-${createdReply.id}`,
        stickToBottom: true,
      });
      setExpandedReplyId(targetComment.id);
      resetComposer();
      await reloadComments();
      return;
    }

    const selectedPollOptionId = Object.entries(pollOptionLabelById).find(
      ([, label]) => label === activeChoice,
    )?.[0];
    const createdComment = await commentApi.createComment({
      content: body,
      newsId,
      pollOptionId: selectedPollOptionId ?? null,
      userId: mockCurrentUserId,
    });

    setPendingScrollTarget({
      bottomGap: 0,
      id: `${panelId}-comment-${createdComment.id}`,
      stickToBottom: true,
    });
    resetComposer();
    await reloadComments();
  }

  function toggleCommentReaction(
    commentId: CommentId,
    reaction: CommentReactionValue,
  ) {
    const targetComment = apiComments.find((comment) => comment.id === commentId);
    const currentReaction = commentReactionRows[commentId] ?? null;

    if (!targetComment) {
      return;
    }

    const nextReaction = currentReaction?.type === reaction ? null : reaction;
    const likeDelta =
      (nextReaction === "like" ? 1 : 0) -
      (currentReaction?.type === "like" ? 1 : 0);
    const dislikeDelta =
      (nextReaction === "dislike" ? 1 : 0) -
      (currentReaction?.type === "dislike" ? 1 : 0);
    const currentReactionCounts = commentReactionCounts[commentId] ?? {
      ...emptyCommentReactionCounts,
    };
    const nextLikeCount = Math.max(
      0,
      currentReactionCounts.like + likeDelta,
    );
    const nextDislikeCount = Math.max(
      0,
      currentReactionCounts.dislike + dislikeDelta,
    );

    setCommentReactions((currentReactions) => ({
      ...currentReactions,
      [commentId]: nextReaction,
    }));
    setCommentReactionCounts((currentCounts) => {
      const currentCommentCounts = currentCounts[commentId] ?? {
        ...emptyCommentReactionCounts,
      };

      return {
        ...currentCounts,
        [commentId]: {
          dislike: Math.max(0, currentCommentCounts.dislike + dislikeDelta),
          like: Math.max(0, currentCommentCounts.like + likeDelta),
        },
      };
    });
    setApiComments((currentComments) =>
      currentComments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              dislikeCount: Math.max(0, comment.dislikeCount + dislikeDelta),
              likeCount: Math.max(0, comment.likeCount + likeDelta),
            }
          : comment,
      ),
    );

    void (async () => {
      if (!nextReaction && currentReaction) {
        await commentApi.removeCommentReaction(currentReaction.id);
      } else if (nextReaction && currentReaction) {
        await commentApi.updateCommentReaction(currentReaction.id, nextReaction);
      } else if (nextReaction) {
        await commentApi.addCommentReaction({
          commentId,
          type: nextReaction,
          userId: mockCurrentUserId,
        });
      }

      await commentApi.updateCommentReactionCounts(commentId, {
        dislikeCount: nextDislikeCount,
        likeCount: nextLikeCount,
      });
      await reloadComments();
    })();
  }

  function handleCommentAction(commentId: CommentId, action: CommentAction) {
    setOpenCommentActionId(null);
    setOpenReplyActionId(null);

    if (action === "delete") {
      void commentApi.deleteComment(commentId).then(reloadComments);
      setDeletedCommentIds((currentIds) =>
        currentIds.includes(commentId)
          ? currentIds
          : [...currentIds, commentId],
      );
      setExpandedReplyId((currentId) =>
        currentId === commentId ? null : currentId,
      );
      if (replyTargetCommentId === commentId) {
        resetComposer();
      }
      commentEdit.clearEdit(commentId);
      setCommentReactions((currentReactions) => {
        const { [commentId]: _deletedReaction, ...nextReactions } =
          currentReactions;

        return nextReactions;
      });
      return;
    }

    if (action === "edit") {
      startEditComment(commentId);
    }
  }

  function handleReplyAction(reply: CommentReplyItem, action: CommentAction) {
    setOpenReplyActionId(null);

    if (action === "delete") {
      void commentApi.deleteComment(reply.id).then(reloadComments);
      setDeletedReplyIds((currentIds) =>
        currentIds.includes(reply.id) ? currentIds : [...currentIds, reply.id],
      );
      replyEdit.clearEdit(reply.id);
      return;
    }

    if (action === "edit") {
      startEditReply(reply, replyEdit.getEditedValue(reply.id) ?? reply.body);
    }
  }

  return (
    <>
      <section
        className="wrapper_commentPanel newsroll_motion_enterUp"
        id={id}
        ref={panelRef}
        aria-label="댓글 반응"
      >
        <div className="wrapper_commentSummary">
          <span className="text_commentTotal">댓글 {allComments.length}</span>
          <Button
            aria-pressed={myCommentsOnly}
            className="btn_commentMineFilter"
            classNameOnly
            onClick={() => {
              setMyCommentsOnly((current) => !current);
              setActiveChoice(commentTabs[0].id);
            }}
            type="button"
          >
            나의 댓글
          </Button>
        </div>

        <section
          className="container_commentGuide"
          aria-label="안내 선택지별 댓글"
        >
          <div className="wrapper_commentGuideTabs">
            <h3>투표 선택지 별</h3>
            <PillTabMenu
              ariaLabel="안내 선택지별 댓글 필터"
              className="wrapper_commentTabs"
              items={commentTabs}
              onChange={setActiveChoice}
              value={activeChoice}
            />
          </div>

          <div className="wrapper_commentGuideComments">
            <NewsRollDropdownMenu
              ariaLabel="댓글 정렬"
              className="wrapper_commentSort"
              isOpen={isCommentSortOpen}
              listboxId={commentSortMenuId}
              onChange={setSortOrder}
              onOpenChange={(nextOpen) => {
                setOpenCommentActionId(null);
                setOpenReplyActionId(null);
                setIsCommentSortOpen(nextOpen);
              }}
              options={commentSortOptions}
              value={sortOrder}
            />

            <div
              className="wrapper_commentList"
              id={commentListId}
              style={commentListStyle}
            >
              {visibleComments.length > 0 ? (
                visibleComments.map((comment, index) => {
                  const selectedReaction = commentReactions[comment.id] ?? null;
                  const { dislikes: dislikeCount, likes: likeCount } =
                    getCommentReactionCounts(comment);
                  const actionMenuId = `${panelId}-comment-action-${comment.id}`;
                  const commentActions = comment.isMine
                    ? myCommentActionOptions
                    : otherCommentActionOptions;
                  const replyToggleId = `${panelId}-reply-toggle-${comment.id}`;
                  const replyListId = `${panelId}-reply-list-${comment.id}`;
                  const isReplyListOpen = expandedReplyId === comment.id;
                  const isEditingComment =
                    commentEdit.editingId === comment.id;
                  const commentReplies = (commentsByParentId[comment.id] ?? [])
                    .map((reply) => ({
                      author: getCommentAuthor(reply.userId),
                      body: reply.content,
                      choice: getCommentChoice(
                        reply,
                        guideChoices,
                        pollOptionLabelById,
                      ),
                      date: formatCommentDate(reply.createdAt),
                      dislikes: reply.dislikeCount,
                      id: reply.id,
                      isMine: reply.userId === mockCurrentUserId,
                      likes: reply.likeCount,
                    }))
                    .filter((reply) => !deletedReplyIdSet.has(reply.id));

                  return (
                    <Fragment key={comment.id}>
                      {index > 0 ? (
                        <span
                          aria-hidden="true"
                          className="divider_commentItem"
                        />
                      ) : null}
                      <article
                        className="wrapper_commentItem"
                        id={`${panelId}-comment-${comment.id}`}
                      >
                        <header>
                          <span className="wrapper_commentMeta">
                            <strong>{comment.author}</strong>
                            <NewsCreatedTime>{comment.date}</NewsCreatedTime>
                          </span>
                          <span className="wrapper_commentAction">
                            <IconButton
                              aria-label="댓글 더보기"
                              aria-controls={
                                openCommentActionId === comment.id
                                  ? actionMenuId
                                  : undefined
                              }
                              aria-expanded={openCommentActionId === comment.id}
                              aria-haspopup="menu"
                              baseClassName="btn_commentAction"
                              icon="detail"
                              label="댓글 더보기"
                              onClick={() => {
                                setIsCommentSortOpen(false);
                                setOpenReplyActionId(null);
                                setOpenCommentActionId((current) =>
                                  current === comment.id ? null : comment.id,
                                );
                              }}
                            />
                            {openCommentActionId === comment.id ? (
                              <div
                                className="listbox_commentDropdown listbox_commentAction"
                                id={actionMenuId}
                                role="menu"
                              >
                                {commentActions.map((option) => (
                                  <button
                                    key={option.value}
                                    onClick={() =>
                                      handleCommentAction(
                                        comment.id,
                                        option.value,
                                      )
                                    }
                                    role="menuitem"
                                    type="button"
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </span>
                        </header>
                        <ChipLabel kind="commentChoice">
                          {comment.choice}
                        </ChipLabel>
                        {isEditingComment ? (
                          <CommentInlineEditor
                            ariaLabel="댓글 수정"
                            onCancel={cancelEditComment}
                            onChange={commentEdit.setDraft}
                            onSave={saveEditedComment}
                            value={commentEdit.draft}
                          />
                        ) : (
                          <p>{comment.body}</p>
                        )}
                        <footer>
                          <button
                            aria-controls={replyListId}
                            aria-expanded={isReplyListOpen}
                            id={replyToggleId}
                            onClick={() => toggleReplyList(comment.id)}
                            type="button"
                          >
                            대댓글 {commentReplies.length}
                          </button>
                          <span>
                            <ReactionButton
                              aria-label="댓글 좋아요"
                              aria-pressed={selectedReaction === "like"}
                              icon="thumbUp"
                              onClick={() =>
                                toggleCommentReaction(comment.id, "like")
                              }
                              tone="like"
                              variant="comment"
                            >
                              {getVisibleReactionCount(likeCount)}
                            </ReactionButton>
                            <ReactionButton
                              aria-label="댓글 싫어요"
                              aria-pressed={selectedReaction === "dislike"}
                              icon="thumbDown"
                              onClick={() =>
                                toggleCommentReaction(comment.id, "dislike")
                              }
                              tone="dislike"
                              variant="comment"
                            >
                              {getVisibleReactionCount(dislikeCount)}
                            </ReactionButton>
                          </span>
                        </footer>
                        <div
                          aria-hidden={!isReplyListOpen}
                          aria-labelledby={replyToggleId}
                          className={`wrapper_commentReplies${isReplyListOpen ? " is_open" : ""}`}
                          id={replyListId}
                          role="region"
                        >
                          <div className="wrapper_commentRepliesInner">
                            <Button
                              className="btn_originalArticle"
                              classNameOnly
                              aria-controls={composerId}
                              aria-pressed={
                                composerMode === "reply" &&
                                replyTargetCommentId === comment.id
                              }
                              onClick={() => startReplyComposer(comment.id)}
                              type="button"
                            >
                              대댓글 달기
                            </Button>
                            {commentReplies.map((reply, replyIndex) => {
                              const replyActionMenuId = `${panelId}-reply-action-${reply.id}`;
                              const replyActions = reply.isMine
                                ? myCommentActionOptions
                                : otherCommentActionOptions;
                              const isEditingReply =
                                replyEdit.editingId === reply.id;
                              const replyBody =
                                replyEdit.getEditedValue(reply.id) ??
                                reply.body;
                              const selectedReplyReaction =
                                commentReactions[reply.id] ?? null;
                              const {
                                dislikes: replyDislikeCount,
                                likes: replyLikeCount,
                              } = getCommentReactionCounts(reply);

                              return (
                                <Fragment key={reply.id}>
                                  <article
                                    className="wrapper_commentReplyItem"
                                    id={`${panelId}-reply-${reply.id}`}
                                  >
                                    <header>
                                      <span className="wrapper_commentMeta">
                                        <strong>{reply.author}</strong>
                                        <NewsCreatedTime>
                                          {reply.date}
                                        </NewsCreatedTime>
                                      </span>
                                      <span className="wrapper_commentAction">
                                        <IconButton
                                          aria-label="대댓글 더보기"
                                          aria-controls={
                                            openReplyActionId === reply.id
                                              ? replyActionMenuId
                                              : undefined
                                          }
                                          aria-expanded={
                                            openReplyActionId === reply.id
                                          }
                                          aria-haspopup="menu"
                                          baseClassName="btn_commentAction"
                                          disabled={!isReplyListOpen}
                                          icon="detail"
                                          label="대댓글 더보기"
                                          onClick={() => {
                                            setIsCommentSortOpen(false);
                                            setOpenCommentActionId(null);
                                            setOpenReplyActionId((current) =>
                                              current === reply.id
                                                ? null
                                                : reply.id,
                                            );
                                          }}
                                        />
                                        {openReplyActionId === reply.id ? (
                                          <div
                                            className="listbox_commentDropdown listbox_commentAction"
                                            id={replyActionMenuId}
                                            role="menu"
                                          >
                                            {replyActions.map(
                                              (option) => (
                                                <button
                                                  key={option.value}
                                                  onClick={() =>
                                                    handleReplyAction(
                                                      reply,
                                                      option.value,
                                                    )
                                                  }
                                                  role="menuitem"
                                                  type="button"
                                                >
                                                  {option.label}
                                                </button>
                                              ),
                                            )}
                                          </div>
                                        ) : null}
                                      </span>
                                    </header>
                                    <ChipLabel kind="commentChoice">
                                      {reply.choice}
                                    </ChipLabel>
                                    {isEditingReply ? (
                                      <CommentInlineEditor
                                        ariaLabel="대댓글 수정"
                                        onCancel={cancelEditReply}
                                        onChange={replyEdit.setDraft}
                                        onSave={saveEditedReply}
                                        value={replyEdit.draft}
                                      />
                                    ) : (
                                      <p>{replyBody}</p>
                                    )}
                                    <footer>
                                      <span>
                                        <ReactionButton
                                          aria-label="대댓글 좋아요"
                                          aria-pressed={
                                            selectedReplyReaction === "like"
                                          }
                                          icon="thumbUp"
                                          onClick={() =>
                                            toggleCommentReaction(reply.id, "like")
                                          }
                                          tone="like"
                                          variant="comment"
                                        >
                                          {getVisibleReactionCount(replyLikeCount)}
                                        </ReactionButton>
                                        <ReactionButton
                                          aria-label="대댓글 싫어요"
                                          aria-pressed={
                                            selectedReplyReaction === "dislike"
                                          }
                                          icon="thumbDown"
                                          onClick={() =>
                                            toggleCommentReaction(
                                              reply.id,
                                              "dislike",
                                            )
                                          }
                                          tone="dislike"
                                          variant="comment"
                                        >
                                          {getVisibleReactionCount(replyDislikeCount)}
                                        </ReactionButton>
                                      </span>
                                    </footer>
                                  </article>
                                  {replyIndex < commentReplies.length - 1 ? (
                                    <span
                                      aria-hidden="true"
                                      className="divider_commentItem"
                                    />
                                  ) : null}
                                </Fragment>
                              );
                            })}
                          </div>
                        </div>
                      </article>
                    </Fragment>
                  );
                })
              ) : commentLoadFailed ? (
                <DataUnavailableMessage target="댓글" />
              ) : (
                <p className="text_commentEmpty">표시할 댓글이 없습니다.</p>
              )}
            </div>
          </div>
        </section>
      </section>
      {isComposerVisible ? (
        <ClientPortal>
          <div
            aria-label={composerMode === "reply" ? "대댓글 작성" : "댓글 작성"}
            className="container_commentComposerFixed newsroll_motion_enterUp"
            id={composerId}
            role="region"
          >
            <form
              className="form_commentComposer"
              onSubmit={(event) => {
                event.preventDefault();
                submitComposer();
              }}
            >
              <CommentComposerInput
                label={composerMode === "reply" ? "대댓글 입력" : "댓글 입력"}
                onChange={(event) => setComposerDraft(event.target.value)}
                placeholder={
                  composerMode === "reply"
                    ? "대댓글을 입력해 주세요."
                    : "홍길동님은 어떻게 생각하시나요?"
                }
                submitLabel={
                  composerMode === "reply" ? "대댓글 등록" : "댓글 등록"
                }
                value={composerDraft}
              />
            </form>
          </div>
        </ClientPortal>
      ) : null}
    </>
  );
}

function ClientPortal({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return createPortal(children, document.body);
}

function HomeReelCard({
  article,
  framed = true,
  headingLevel = "h2",
  index,
  initialCommentId,
  initialReplyTargetId,
  initialScrollTarget,
  recordRecentOnView = true,
}: {
  article: HomeArticle;
  framed?: boolean;
  headingLevel?: "h1" | "h2";
  index: number | string;
  initialCommentId?: CommentId;
  initialReplyTargetId?: CommentId;
  initialScrollTarget?: ArticleDetailOpenOptions["scrollTarget"];
  recordRecentOnView?: boolean;
}) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);
  const [isCommentPanelOpen, setIsCommentPanelOpen] = useState(
    initialCommentId != null || initialReplyTargetId != null,
  );
  const [isShared, setIsShared] = useState(false);
  const [reaction, setReaction] = useState<Reaction>(null);
  const [articleReactionId, setArticleReactionId] = useState<string | null>(null);
  const [articleReactionCounts, setArticleReactionCounts] = useState<
    Record<ReactionValue, number>
  >({ ...emptyArticleReactionCounts });
  const [visibleViewCount, setVisibleViewCount] = useState(article.viewCount);
  const cardRef = useRef<HTMLElement>(null);
  const hasTrackedViewRef = useRef(false);
  const numericIndex = typeof index === "number" ? index : 0;
  const commentPanelId = `home-comment-panel-${index}`;
  const articleContentId = `home-article-content-${index}`;
  const articleGuideId = `home-article-guide-${index}`;
  const articleTitleId = `home-article-title-${index}`;
  const ArticleTitle = headingLevel;

  function handleCommentPanelToggle() {
    setIsCommentPanelOpen((current) => !current);
  }

  useEffect(() => {
    let ignore = false;

    async function loadUserArticleState() {
      if (!article.id) {
        setIsBookmarked(false);
        setBookmarkId(null);
        setReaction(null);
        setArticleReactionId(null);
        setArticleReactionCounts({ ...emptyArticleReactionCounts });
        return;
      }

      const [bookmarks, nextReaction, nextReactions] = await Promise.all([
        bookmarkApi.getBookmarks(mockCurrentUserId),
        newsApi.getNewsReaction(article.id, mockCurrentUserId),
        newsApi.getNewsReactions(article.id),
      ]);
      const bookmark = bookmarks.find(
        (item) => item.targetType === "news" && item.targetId === article.id,
      );

      if (!ignore) {
        setIsBookmarked(Boolean(bookmark));
        setBookmarkId(bookmark?.id ?? null);
        setReaction(nextReaction?.type ?? null);
        setArticleReactionId(nextReaction?.id ?? null);
        setArticleReactionCounts(getArticleReactionCounts(nextReactions));
      }
    }

    loadUserArticleState().catch(() => {
      if (!ignore) {
        setIsBookmarked(false);
        setBookmarkId(null);
        setReaction(null);
        setArticleReactionId(null);
        setArticleReactionCounts({ ...emptyArticleReactionCounts });
      }
    });

    return () => {
      ignore = true;
    };
  }, [article.id]);

  useEffect(() => {
    hasTrackedViewRef.current = false;
    setVisibleViewCount(article.viewCount);
  }, [article.id, article.viewCount]);

  useEffect(() => {
    if (!article.id || hasTrackedViewRef.current) {
      return;
    }

    function trackView() {
      if (!article.id || hasTrackedViewRef.current) {
        return;
      }

      hasTrackedViewRef.current = true;
      const recentViewRequest = recordRecentOnView
        ? newsApi.addRecentNewsView({
            newsId: article.id,
            userId: mockCurrentUserId,
          })
        : Promise.resolve(undefined);

      Promise.all([newsApi.increaseNewsViewCount(article.id), recentViewRequest])
        .then(([nextArticle]) => setVisibleViewCount(nextArticle.viewCount))
        .catch(() => undefined);
    }

    if (!framed) {
      trackView();
      return;
    }

    const target = cardRef.current;

    if (!target || typeof IntersectionObserver === "undefined") {
      trackView();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5)) {
          trackView();
          observer.disconnect();
        }
      },
      { threshold: [0.5] },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [article.id, framed, recordRecentOnView]);

  async function toggleBookmark() {
    if (!article.id) {
      return;
    }

    if (isBookmarked && bookmarkId) {
      setIsBookmarked(false);
      setBookmarkId(null);
      await bookmarkApi.removeBookmark(bookmarkId);
      return;
    }

    const bookmark = await bookmarkApi.addBookmark({
      targetId: article.id,
      targetType: "news",
      userId: mockCurrentUserId,
    });

    setIsBookmarked(true);
    setBookmarkId(bookmark.id);
  }

  async function toggleArticleReaction(nextReaction: Reaction) {
    if (!article.id) {
      return;
    }

    const previousReaction = reaction;

    setReaction(nextReaction);
    setArticleReactionCounts((currentCounts) => {
      const nextCounts = { ...currentCounts };

      if (previousReaction) {
        nextCounts[previousReaction] = Math.max(0, nextCounts[previousReaction] - 1);
      }
      if (nextReaction) {
        nextCounts[nextReaction] += 1;
      }

      return nextCounts;
    });

    if (nextReaction === null) {
      if (articleReactionId) {
        setArticleReactionId(null);
        await newsApi.removeNewsReaction(articleReactionId);
      }
      return;
    }

    if (articleReactionId) {
      await newsApi.updateNewsReaction(
        articleReactionId,
        nextReaction as ArticleReactionType,
      );
      return;
    }

    const createdReaction = await newsApi.addNewsReaction({
      newsId: article.id,
      type: nextReaction as ArticleReactionType,
      userId: mockCurrentUserId,
    });

    setArticleReactionId(createdReaction.id);
  }

  useEffect(() => {
    if (initialCommentId == null && initialReplyTargetId == null) {
      return;
    }

    setIsCommentPanelOpen(true);
  }, [initialCommentId, initialReplyTargetId]);
  useDeferredDetailScroll({
    bottomGap: 80,
    delayMs: commentScrollDelayMs,
    enabled: initialScrollTarget === "poll",
    resetKey: article.id ?? article.title,
    targetId: initialScrollTarget === "poll" ? articleGuideId : null,
  });

  const articleContent = (
    <div
      aria-labelledby={articleTitleId}
      className="wrapper_articleCardContent"
      id={articleContentId}
      role="region"
      tabIndex={0}
    >
      <div className="wrapper_articleSummary">
        <ChipLabel kind="articleCategory">{article.category}</ChipLabel>
        <ArticleTitle id={articleTitleId}>{article.title}</ArticleTitle>
        <HomeArticleMeta
          date={article.date}
          dateTime={article.dateTime}
          viewCount={visibleViewCount}
        />
      </div>
      <ArticleActionButtons
        isBookmarked={isBookmarked}
        isShared={isShared}
        onBookmark={() => {
          void toggleBookmark();
        }}
        onShare={() => setIsShared((current) => !current)}
      />
      <img alt={article.imageAlt} src={article.image} />
      <p className="text_articleBody">{article.body ?? articleBody}</p>

      <div className="wrapper_articleSource">
        <div className="wrapper_articleSourcePublisher">
          <img
            className="img_articlePublisherLogo"
            src="/icons/icon_my_page_active.svg"
            alt=""
            width={32}
            height={32}
          />
          <span className="text_articlePublisherName">
            {article.pressName ??
              (numericIndex % 2 === 0 ? "국민일보" : "중앙일보")}
          </span>
        </div>
        <span className="text_articleReporter">
          {article.reporterName ?? "홍길동 기자"}
        </span>
      </div>

      <Button
        className="btn_originalArticle"
        classNameOnly
        href="https://example.com/original-news"
        size="medium"
        variant="filled"
      >
        기사 원문 보기
      </Button>

      <ReactionControls
        counts={articleReactionCounts}
        reaction={reaction}
        onReactionChange={(nextReaction) => {
          void toggleArticleReaction(nextReaction);
        }}
      />

      <ArticleGuideSection
        id={articleGuideId}
        kind={article.guideKind ?? "stacked"}
        newsId={article.id}
      />

      <Button
        aria-controls={isCommentPanelOpen ? commentPanelId : undefined}
        aria-expanded={isCommentPanelOpen}
        className="btn_commentPanel"
        classNameOnly
        onClick={handleCommentPanelToggle}
        size="large"
        variant="filled"
      >
        <Icon name="chat" />
        댓글 반응보기
      </Button>
      {isCommentPanelOpen ? (
        <CommentReactionPanel
          guideKind={article.guideKind ?? "stacked"}
          id={commentPanelId}
          initialCommentId={initialCommentId}
          initialReplyTargetId={initialReplyTargetId}
          newsId={article.id}
        />
      ) : null}
    </div>
  );

  if (!framed) {
    return articleContent;
  }

  return (
    <article
      aria-labelledby={articleTitleId}
      className="container_articleCard"
      ref={cardRef}
    >
      {articleContent}
    </article>
  );
}

function ArticleDetailContent({
  article,
  backLabel,
  initialCommentId,
  initialReplyTargetId,
  initialScrollTarget,
  isLeaving = false,
  onBack,
}: {
  article: HomeArticle;
  backLabel?: string;
  initialCommentId?: CommentId;
  initialReplyTargetId?: CommentId;
  initialScrollTarget?: ArticleDetailOpenOptions["scrollTarget"];
  isLeaving?: boolean;
  onBack?: () => void;
}) {
  return (
    <NewsRollArticleDetailPanel
      ariaLabel="기사 상세"
      backLabel={backLabel}
      className={getEnterFromRightMotionClassName(isLeaving)}
      labelledBy="home-article-title-detail"
      onBack={onBack}
    >
      <HomeReelCard
        article={article}
        framed={false}
        headingLevel="h1"
        initialCommentId={initialCommentId}
        initialReplyTargetId={initialReplyTargetId}
        initialScrollTarget={initialScrollTarget}
        index="detail"
      />
    </NewsRollArticleDetailPanel>
  );
}

function getDataUnavailableMessage(target: string, particle = "을") {
  return `${target}${particle} 불러오지 못했습니다.`;
}

function DataUnavailableMessage({
  particle,
  target,
}: {
  particle?: string;
  target: string;
}) {
  return (
    <p className="text_commentEmpty">
      {getDataUnavailableMessage(target, particle)}
    </p>
  );
}

function NewsRollStateCard({
  children,
  role,
}: {
  children: ReactNode;
  role?: "alert" | "status";
}) {
  return (
    <article className="container_articleCard newsroll_homeStateCard">
      <div
        className="wrapper_articleCardContent newsroll_homeStateContent"
        role={role}
        tabIndex={0}
      >
        {children}
      </div>
    </article>
  );
}

function HomeView({
  blockedKeywords,
  isTextLarge,
  onOpenBreakingNews,
  onOpenMenu,
  onOpenSearch,
  onToggleTextSize,
}: {
  blockedKeywords: string[];
  isTextLarge: boolean;
  onOpenBreakingNews: () => void;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  onToggleTextSize: () => void;
}) {
  const [homeViewMode, setHomeViewMode] = useState<HomeViewMode>("reels");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDetailArticle, setSelectedDetailArticle] =
    useState<HomeArticle | null>(null);
  const [articles, setArticles] = useState<HomeArticle[]>([]);
  const [isNewsLoading, setIsNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);
  const homeReelsRecentKeyRef = useRef("");
  const closeHomeDetailImmediately = useCallback(() => {
    setDetailOpen(false);
  }, []);
  const homeDetailExitMotion = useEnterFromRightExitMotion({
    isOpen: detailOpen,
    onClose: closeHomeDetailImmediately,
  });

  function openHomeDetail(article: HomeArticle) {
    setSelectedDetailArticle(article);
    setDetailOpen(true);
  }

  useEffect(() => {
    let ignore = false;

    async function loadHomeNews() {
      setIsNewsLoading(true);
      setNewsError(null);

      try {
        const nextNews = await newsApi.getNewsList();

        if (!ignore) {
          setArticles(nextNews.map(getHomeArticleFromNews));
        }
      } catch {
        if (!ignore) {
          setNewsError(getDataUnavailableMessage("뉴스", "를"));
        }
      } finally {
        if (!ignore) {
          setIsNewsLoading(false);
        }
      }
    }

    loadHomeNews();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const visibleArticles = filterArticlesByBlockedKeywords(articles, blockedKeywords);

    if (homeViewMode !== "reels" || detailOpen || visibleArticles.length === 0) {
      return;
    }

    const articleIds = visibleArticles
      .map((article) => article.id)
      .filter((id): id is string => Boolean(id));
    const recentKey = articleIds.join("|");

    if (!recentKey || homeReelsRecentKeyRef.current === recentKey) {
      return;
    }

    homeReelsRecentKeyRef.current = recentKey;
    articleIds.forEach((newsId) => {
      newsApi
        .addRecentNewsView({
          newsId,
          userId: mockCurrentUserId,
        })
        .catch(() => undefined);
    });
  }, [articles, blockedKeywords, detailOpen, homeViewMode]);

  const visibleArticles = useMemo(
    () => filterArticlesByBlockedKeywords(articles, blockedKeywords),
    [articles, blockedKeywords],
  );
  const hasArticles = visibleArticles.length > 0;
  const latestBreakingItem = getLatestBreakingNewsItem(visibleArticles);
  const breakingTitle =
    latestBreakingItem?.title ??
    getDataUnavailableMessage("속보", "를");

  return (
    <HomeShell
      breakingItem={latestBreakingItem}
      breakingTitle={breakingTitle}
      isDetailOpen={detailOpen}
      isTextLarge={isTextLarge}
      mode={homeViewMode}
      newsCount={visibleArticles.length}
      onCloseDetail={homeDetailExitMotion.closeWithMotion}
      onOpenBreakingArticle={openHomeDetail}
      onModeChange={(nextMode) => {
        setDetailOpen(false);
        setHomeViewMode(nextMode);
      }}
      onOpenBreakingNews={onOpenBreakingNews}
      onOpenMenu={onOpenMenu}
      onOpenSearch={onOpenSearch}
      onToggleTextSize={onToggleTextSize}
    >
      {detailOpen ? (
        selectedDetailArticle ? (
          <ArticleDetailContent
            article={selectedDetailArticle}
            isLeaving={homeDetailExitMotion.isLeaving}
          />
        ) : null
      ) : homeViewMode === "reels" ? (
        <section
          className={`container_newsFeed${isNewsLoading || newsError || !hasArticles ? " is_emptyState" : ""}`}
          id="home-news-reels-panel"
          role="tabpanel"
          aria-labelledby="home-news-view-tab-reels"
        >
          {isNewsLoading ? (
            <NewsRollStateCard role="status">
              <p className="text_commentEmpty">뉴스를 불러오는 중입니다.</p>
            </NewsRollStateCard>
          ) : newsError ? (
            <NewsRollStateCard role="alert">
              <p className="text_commentEmpty">{newsError}</p>
            </NewsRollStateCard>
          ) : hasArticles ? (
            visibleArticles.map((article, index) => (
              <HomeReelCard
                article={article}
                index={index}
                key={article.id ?? `${article.title}-${index}`}
                recordRecentOnView={false}
              />
            ))
          ) : (
            <NewsRollStateCard>
              <p className="text_commentEmpty">표시할 뉴스가 없습니다.</p>
            </NewsRollStateCard>
          )}
        </section>
      ) : (
        <section
          className="container_newsGrid container_newsGrid_block"
          id="home-news-block-panel"
          role="tabpanel"
          aria-labelledby="home-news-view-tab-block"
        >
          <div className="wrapper_newsGridScroll">
            {isNewsLoading ? (
              <NewsRollStateCard role="status">
                <p className="text_commentEmpty">뉴스를 불러오는 중입니다.</p>
              </NewsRollStateCard>
            ) : newsError ? (
              <NewsRollStateCard role="alert">
                <p className="text_commentEmpty">{newsError}</p>
              </NewsRollStateCard>
            ) : hasArticles ? (
              visibleArticles.map((article) => (
                <NewsBlockItem
                  dateLabel={article.date}
                  dateTime={article.dateTime ?? defaultNewsDateTime}
                  imageAlt={article.imageAlt}
                  imageSrc={article.image}
                  key={article.id ?? article.title}
                  onClick={() => openHomeDetail(article)}
                  title={article.title}
                />
              ))
            ) : (
              <NewsRollStateCard>
                <p className="text_commentEmpty">표시할 뉴스가 없습니다.</p>
              </NewsRollStateCard>
            )}
          </div>
        </section>
      )}
    </HomeShell>
  );
}

function SearchView({
  blockedKeywords,
  onClose,
}: {
  blockedKeywords: string[];
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [isSearchComposerOpen, setIsSearchComposerOpen] = useState(false);
  const [articles, setArticles] = useState<HomeArticle[]>([]);
  const [isNewsLoading, setIsNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [detailArticle, setDetailArticle] = useState<HomeArticle | null>(null);
  const searchComposerRef = useRef<HTMLFormElement>(null);
  const normalizedQuery = normalizeBlockedKeyword(query);
  const searchResults = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return filterArticlesByBlockedKeywords(articles, blockedKeywords).filter((article) =>
      getArticleFilterText(article).includes(normalizedQuery),
    );
  }, [articles, blockedKeywords, normalizedQuery]);

  useEffect(() => {
    let ignore = false;

    async function loadSearchNews() {
      setIsNewsLoading(true);
      setNewsError(null);

      try {
        const nextNews = await newsApi.getNewsList();

        if (!ignore) {
          setArticles(nextNews.map(getHomeArticleFromNews));
        }
      } catch {
        if (!ignore) {
          setNewsError(getDataUnavailableMessage("뉴스", "를"));
        }
      } finally {
        if (!ignore) {
          setIsNewsLoading(false);
        }
      }
    }

    loadSearchNews();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!isSearchComposerOpen) {
      return;
    }

    window.requestAnimationFrame(() => {
      searchComposerRef.current?.querySelector("input")?.focus();
    });
  }, [isSearchComposerOpen]);

  const closeSearchDetail = () => {
    setDetailArticle(null);
  };

  return (
    <section className="newsroll_search_page" aria-label="검색">
      <div className="newsroll_toolbar newsroll_search_top" aria-label="검색 도구">
        <button
          aria-label={detailArticle ? "검색 결과로 돌아가기" : "검색 닫기"}
          className="newsroll_toolbar_icon newsroll_search_close"
          onClick={detailArticle ? closeSearchDetail : onClose}
          type="button"
        >
          <span aria-hidden="true" />
        </button>
      </div>

      {detailArticle ? (
        <ArticleDetailContent article={detailArticle} />
      ) : (
        <div className="wrapper_searchContent">
          {isSearchComposerOpen ? (
            <form
              className="form_searchComposer newsroll_motion_enterUp"
              onSubmit={(event) => event.preventDefault()}
              ref={searchComposerRef}
            >
              <CommentComposerInput
                label="통합검색어 입력"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="검색 키워드를 입력해주세요"
                submitLabel="검색"
                value={query}
              />
            </form>
          ) : (
            <button
              aria-label="통합검색어 입력 열기"
              className="btn_searchFieldTrigger"
              onClick={() => setIsSearchComposerOpen(true)}
              type="button"
            >
              <span>검색 키워드를 입력해주세요</span>
              <Icon name="search" />
            </button>
          )}

          {isNewsLoading ? (
            <NewsRollStateCard role="status">
              <p className="text_commentEmpty">뉴스를 불러오는 중입니다.</p>
            </NewsRollStateCard>
          ) : newsError ? (
            <NewsRollStateCard role="alert">
              <p className="text_commentEmpty">{newsError}</p>
            </NewsRollStateCard>
          ) : normalizedQuery ? (
            <article
              aria-label="통합검색 결과"
              className="container_articleCard newsroll_all_panel newsroll_all_relay_panel"
            >
              <AllNewsPanelContent>
                <h2 className="newsroll_all_section_title">
                  검색 결과 {searchResults.length}
                </h2>
                {searchResults.length > 0 ? (
                  <SeparatedList
                    dividerClassName="newsroll_all_itemDivider"
                    getKey={(item, index) => item.article?.id ?? `${item.title}-${index}`}
                    items={searchResults.map(getAllNewsPreviewFromArticle)}
                    renderItem={(item, index) => (
                      <AllNewsRelayItem
                        item={item}
                        onClick={() =>
                          setDetailArticle(
                            createAllNewsArticle(item, item.category ?? homeArticle.category, index),
                          )
                        }
                      />
                    )}
                  />
                ) : (
                  <p className="text_commentEmpty">검색 결과가 없습니다.</p>
                )}
              </AllNewsPanelContent>
            </article>
          ) : null}
        </div>
      )}
    </section>
  );
}

function AllNewsMeta() {
  return (
    <p className="newsroll_all_meta">
      <NewsCreatedTime />
      <NewsViewCount className="newsroll_all_views" />
    </p>
  );
}

function AllNewsMoreButton({
  ariaLabel,
  collapsedLabel = "더보기",
  expanded = false,
  expandedLabel = "접기",
  onClick,
  showIcon = true,
  tone = "light",
}: {
  ariaLabel?: string;
  collapsedLabel?: string;
  expanded?: boolean;
  expandedLabel?: string;
  onClick?: () => void;
  showIcon?: boolean;
  tone?: "dark" | "light";
}) {
  return (
    <button
      aria-label={ariaLabel}
      aria-expanded={showIcon ? expanded : undefined}
      className={`btn_originalArticle newsroll_all_more newsroll_all_more_${tone}`}
      onClick={onClick}
      type="button"
    >
      <span>{expanded ? expandedLabel : collapsedLabel}</span>
      {showIcon ? (
        <img
          className="newsroll_all_more_icon"
          src="/icons/icon_chevron_right.svg"
          alt=""
          aria-hidden="true"
        />
      ) : null}
    </button>
  );
}

type AllNewsPanelContentProps = HTMLAttributes<HTMLDivElement>;

function AllNewsPanelContent({
  children,
  className,
  ...props
}: AllNewsPanelContentProps) {
  const classNames = ["newsroll_all_panelContent", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames} {...props}>
      {children}
    </div>
  );
}

type SeparatedListProps<T> = {
  dividerClassName: string;
  getKey: (item: T, index: number) => string;
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
};

function SeparatedList<T>({
  dividerClassName,
  getKey,
  items,
  renderItem,
}: SeparatedListProps<T>) {
  return (
    <>
      {items.map((item, index) => (
        <Fragment key={getKey(item, index)}>
          {index > 0 ? <NewsRollDivider className={dividerClassName} /> : null}
          {renderItem(item, index)}
        </Fragment>
      ))}
    </>
  );
}

type AllNewsSectionPanelProps = {
  ariaLabel: string;
  children: ReactNode;
  className: string;
  contentProps?: AllNewsPanelContentProps;
  headingLevel?: "h1" | "h2";
  title: ReactNode;
};

function AllNewsSectionPanel({
  ariaLabel,
  children,
  className,
  contentProps,
  headingLevel = "h2",
  title,
}: AllNewsSectionPanelProps) {
  const Heading = headingLevel;

  return (
    <article
      className={`container_articleCard newsroll_all_panel ${className}`}
      aria-label={ariaLabel}
    >
      <AllNewsPanelContent {...contentProps}>
        <Heading className="newsroll_all_section_title">{title}</Heading>
        {children}
      </AllNewsPanelContent>
    </article>
  );
}

type AllNewsArticlePreview = {
  article?: HomeArticle;
  category?: string;
  guideKind?: GuideKind;
  image: string;
  title: string;
};

function createAllNewsArticle(
  preview: AllNewsArticlePreview,
  fallbackCategory: string,
  index: number,
): HomeArticle {
  if (preview.article) {
    return preview.article;
  }

  return {
    category: preview.category ?? fallbackCategory,
    date: homeArticle.date,
    guideKind: preview.guideKind ?? (index % 2 === 0 ? "stacked" : "binary"),
    image: preview.image,
    imageAlt: homeArticle.imageAlt,
    title: preview.title,
  };
}

function getAllNewsPreviewFromArticle(article: HomeArticle): AllNewsArticlePreview {
  return {
    article,
    category: article.category,
    image: article.image,
    title: article.title,
  };
}

function groupAllNewsByValue(
  articles: HomeArticle[],
  getValue: (article: HomeArticle) => string | undefined,
) {
  return articles.reduce<Record<string, AllNewsArticlePreview[]>>(
    (groups, article) => {
      const value = getValue(article);

      if (!value) {
        return groups;
      }

      groups[value] = [...(groups[value] ?? []), getAllNewsPreviewFromArticle(article)];

      return groups;
    },
    {},
  );
}

function AllNewsLatestCard({
  item,
  onClick,
}: {
  item: AllNewsArticlePreview;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={`${item.category} 기사: ${item.title}`}
      className="newsroll_all_latest_card"
      onClick={onClick}
      type="button"
    >
      <span className="chip chip_small chip_filled chip_full newsroll_all_chip">
        {item.category}
      </span>
      <img alt="" className="newsroll_all_latest_image" src={item.image} />
      <span className="newsroll_all_latest_body">
        <strong>{item.title}</strong>
        <AllNewsMeta />
      </span>
    </button>
  );
}

function AllNewsHeadlineItem({
  item,
  onClick,
}: {
  item: AllNewsArticlePreview;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={`헤드라인 기사: ${item.title}`}
      className="newsroll_all_headline_item"
      onClick={onClick}
      type="button"
    >
      <span className="newsroll_all_headline_body">
        <strong>{item.title}</strong>
        <AllNewsMeta />
      </span>
      <img alt="" className="newsroll_all_headline_image" src={item.image} />
    </button>
  );
}

function AllNewsRelayItem({
  item,
  featured = false,
  onClick,
}: {
  featured?: boolean;
  item: AllNewsArticlePreview;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={`릴레이 뉴스 기사: ${item.title}`}
      className="newsroll_all_relay_item"
      onClick={onClick}
      type="button"
    >
      <strong
        className={featured ? "newsroll_all_relay_title_large" : undefined}
      >
        {item.title}
      </strong>
      <AllNewsMeta />
      <img alt="" src={item.image} />
    </button>
  );
}

function AllNewsView({
  blockedKeywords,
  entryMotionClassName = "",
  initialShowAllBreaking = false,
  isTextLarge,
  onOpenMenu,
  onOpenSearch,
  onToggleTextSize,
}: {
  blockedKeywords: string[];
  entryMotionClassName?: string;
  initialShowAllBreaking?: boolean;
  isTextLarge: boolean;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  onToggleTextSize: () => void;
}) {
  const screenRef = useRef<HTMLElement>(null);
  const feedRef = useRef<HTMLElement>(null);
  const dockedPanelScroll = useDockedPanelScroll({
    boundaryDelayMs: nextArticleRevealDelayMs,
    contentScrollerSelector: allNewsDockedScrollSelectors.contentScroller,
    dockedClassName: "is_newsrollSheetDocked",
    immediatePanelSelector: allNewsDockedScrollSelectors.immediatePanel,
    panelSelector: allNewsDockedScrollSelectors.panel,
    rootRef: screenRef,
    scrollerRef: feedRef,
  });
  const [activePress, setActivePress] = useState(allNewsPresses[0]);
  const [activeRelayCategory, setActiveRelayCategory] = useState(
    allNewsRelayCategories[0],
  );
  const latestScrollerRef = useRef<HTMLDivElement>(null);
  const breakingBodyRef = useRef<HTMLDivElement>(null);
  const collapsedBreakingBodyHeightRef = useRef<number | null>(null);
  const latestDragActiveRef = useRef(false);
  const latestDidDragRef = useRef(false);
  const latestDragStartRef = useRef({ scrollLeft: 0, x: 0 });
  const latestTouchIntentRef = useRef<{
    axis: SwipeAxis | null;
    isFromLatestScroller: boolean;
    x: number;
    y: number;
  } | null>(null);
  const [isLatestDragging, setIsLatestDragging] = useState(false);
  const [detailArticle, setDetailArticle] = useState<HomeArticle | null>(null);
  const [allNewsArticles, setAllNewsArticles] = useState<HomeArticle[]>([]);
  const [showAllBreaking, setShowAllBreaking] = useState(initialShowAllBreaking);
  const [showAllHeadlines, setShowAllHeadlines] = useState(false);
  const [allNewsBreakingOffset, setAllNewsBreakingOffset] = useState(0);
  const visibleAllNewsArticles = useMemo(
    () => filterArticlesByBlockedKeywords(allNewsArticles, blockedKeywords),
    [allNewsArticles, blockedKeywords],
  );
  const allNewsLatestItems = useMemo(
    () => visibleAllNewsArticles.slice(0, 10).map(getAllNewsPreviewFromArticle),
    [visibleAllNewsArticles],
  );
  const allNewsHeadlinesByActivePress = useMemo(
    () => groupAllNewsByValue(visibleAllNewsArticles, (article) => article.pressName),
    [visibleAllNewsArticles],
  );
  const currentAllNewsPresses = useMemo(
    () => Object.keys(allNewsHeadlinesByActivePress),
    [allNewsHeadlinesByActivePress],
  );
  const visibleAllNewsPresses =
    currentAllNewsPresses.length > 0 ? currentAllNewsPresses : allNewsPresses;
  const allNewsRelayByActiveCategory = useMemo(
    () => groupAllNewsByValue(visibleAllNewsArticles, (article) => article.category),
    [visibleAllNewsArticles],
  );
  const currentAllNewsRelayCategories = useMemo(
    () => Object.keys(allNewsRelayByActiveCategory),
    [allNewsRelayByActiveCategory],
  );
  const visibleAllNewsRelayCategories =
    currentAllNewsRelayCategories.length > 0
      ? currentAllNewsRelayCategories
      : allNewsRelayCategories;
  const allBreakingItems = useMemo(
    () => getBreakingNewsItems(visibleAllNewsArticles),
    [visibleAllNewsArticles],
  );
  const breakingItems = showAllBreaking
    ? allBreakingItems.slice(0, 5)
    : allBreakingItems.slice(0, 3);
  const relayItems = allNewsRelayByActiveCategory[activeRelayCategory] ?? [];
  const activePressIndex = Math.max(0, visibleAllNewsPresses.indexOf(activePress));
  const activeRelayIndex = Math.max(
    0,
    visibleAllNewsRelayCategories.indexOf(activeRelayCategory),
  );
  const activeHeadlineItems = allNewsHeadlinesByActivePress[activePress] ?? [];
  const headlineItems = showAllHeadlines
    ? activeHeadlineItems
    : activeHeadlineItems.slice(0, 4);
  const allNewsMinInitialTop = pagePanelInitialTop + allNewsBreakingOffset;
  const isDetailOpen = detailArticle !== null;
  const allNewsDetailScrollRestore = useDetailScrollRestore({
    isDetailOpen,
    nestedScrollSelector: allNewsDockedScrollSelectors.contentScroller,
    scrollerRef: feedRef,
  });
  const closeAllNewsDetailImmediately = useCallback(() => {
    allNewsDetailScrollRestore.requestRestore();
    setDetailArticle(null);
  }, [allNewsDetailScrollRestore]);
  const allNewsDetailExitMotion = useEnterFromRightExitMotion({
    isOpen: isDetailOpen,
    onClose: closeAllNewsDetailImmediately,
  });

  useEffect(() => {
    let ignore = false;

    async function loadAllNews() {
      const nextNews = await newsApi.getNewsList();

      if (!ignore) {
        setAllNewsArticles(nextNews.map(getHomeArticleFromNews));
      }
    }

    loadAllNews().catch(() => {
      if (!ignore) {
        setAllNewsArticles([]);
      }
    });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!visibleAllNewsPresses.includes(activePress)) {
      setActivePress(visibleAllNewsPresses[0]);
    }
  }, [activePress, visibleAllNewsPresses]);

  useEffect(() => {
    if (!visibleAllNewsRelayCategories.includes(activeRelayCategory)) {
      setActiveRelayCategory(visibleAllNewsRelayCategories[0]);
    }
  }, [activeRelayCategory, visibleAllNewsRelayCategories]);

  useLayoutEffect(() => {
    const node = breakingBodyRef.current;

    if (!node) {
      return undefined;
    }

    const measureBreakingOffset = () => {
      const currentHeight = Math.round(node.getBoundingClientRect().height);

      if (!showAllBreaking) {
        collapsedBreakingBodyHeightRef.current = currentHeight;
        setAllNewsBreakingOffset(0);
        return;
      }

      const collapsedHeight =
        collapsedBreakingBodyHeightRef.current ?? currentHeight;
      const expansionOffset = Math.max(
        0,
        currentHeight - collapsedHeight + 24,
      );

      setAllNewsBreakingOffset(expansionOffset);
    };

    measureBreakingOffset();
    const frameId = window.requestAnimationFrame(measureBreakingOffset);
    window.addEventListener("resize", measureBreakingOffset);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", measureBreakingOffset);
    };
  }, [showAllBreaking]);

  function isLatestScrollerEventTarget(target: EventTarget | null) {
    return (
      target instanceof Element &&
      target.closest(allNewsDockedScrollSelectors.latestScroller) !== null
    );
  }

  function handleAllNewsTouchStart(event: TouchEvent<HTMLElement>) {
    const touch = event.touches[0] ?? null;

    if (touch) {
      latestTouchIntentRef.current = {
        axis: null,
        isFromLatestScroller: isLatestScrollerEventTarget(event.target),
        x: touch.clientX,
        y: touch.clientY,
      };
    } else {
      latestTouchIntentRef.current = null;
    }

    dockedPanelScroll.handleTouchStart(event);
  }

  function handleAllNewsTouchMove(event: TouchEvent<HTMLElement>) {
    const touch = event.touches[0] ?? null;
    const latestTouchIntent = latestTouchIntentRef.current;

    if (touch && latestTouchIntent?.isFromLatestScroller) {
      const deltaX = touch.clientX - latestTouchIntent.x;
      const deltaY = touch.clientY - latestTouchIntent.y;
      const absoluteX = Math.abs(deltaX);
      const absoluteY = Math.abs(deltaY);

      if (
        !latestTouchIntent.axis &&
        Math.max(absoluteX, absoluteY) > allNewsSwipeAxisThresholdPx
      ) {
        latestTouchIntent.axis =
          absoluteX > absoluteY ? "horizontal" : "vertical";
      }

      if (latestTouchIntent.axis === "horizontal") {
        event.stopPropagation();
        return;
      }
    }

    dockedPanelScroll.handleTouchMove(event);
  }

  function resetLatestTouchIntent() {
    latestTouchIntentRef.current = null;
  }

  function handleLatestPointerDown(event: PointerEvent<HTMLDivElement>) {
    const node = latestScrollerRef.current;

    if (!node) {
      return;
    }

    latestDragActiveRef.current = true;
    latestDidDragRef.current = false;
    setIsLatestDragging(true);
    latestDragStartRef.current = {
      scrollLeft: node.scrollLeft,
      x: event.clientX,
    };
    node.setPointerCapture(event.pointerId);
  }

  function handleLatestPointerMove(event: PointerEvent<HTMLDivElement>) {
    const node = latestScrollerRef.current;

    if (!node || !latestDragActiveRef.current) {
      return;
    }

    const delta = event.clientX - latestDragStartRef.current.x;

    if (Math.abs(delta) > 8) {
      latestDidDragRef.current = true;
    }

    node.scrollLeft = latestDragStartRef.current.scrollLeft - delta;
  }

  function stopLatestDrag(event: PointerEvent<HTMLDivElement>) {
    const node = latestScrollerRef.current;

    latestDragActiveRef.current = false;
    setIsLatestDragging(false);

    if (node?.hasPointerCapture(event.pointerId)) {
      node.releasePointerCapture(event.pointerId);
    }

    if (!node || !latestDidDragRef.current) {
      return;
    }

    const firstCard = node.querySelector<HTMLElement>(
      ".newsroll_all_latest_card",
    );
    const cardStep = firstCard
      ? firstCard.offsetWidth +
        Number.parseFloat(
          getComputedStyle(node).columnGap || getComputedStyle(node).gap || "0",
        )
      : 1;
    const targetIndex = Math.round(node.scrollLeft / cardStep);

    node.scrollTo({
      behavior: "smooth",
      left: targetIndex * cardStep,
    });
  }

  function handlePressTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const lastIndex = visibleAllNewsPresses.length - 1;
    const nextIndexByKey: Record<string, number> = {
      ArrowDown: activePressIndex === lastIndex ? 0 : activePressIndex + 1,
      ArrowLeft: activePressIndex === 0 ? lastIndex : activePressIndex - 1,
      ArrowRight: activePressIndex === lastIndex ? 0 : activePressIndex + 1,
      ArrowUp: activePressIndex === 0 ? lastIndex : activePressIndex - 1,
      End: lastIndex,
      Home: 0,
    };
    const nextIndex = nextIndexByKey[event.key];

    if (nextIndex === undefined) {
      return;
    }

    event.preventDefault();
    setActivePress(visibleAllNewsPresses[nextIndex]);
    document.getElementById(`all-news-press-tab-${nextIndex}`)?.focus();
  }

  function openAllNewsDetail(article: HomeArticle) {
    allNewsDetailScrollRestore.captureScroll();
    setDetailArticle(article);
  }

  function showBreakingNewsList() {
    if (isDetailOpen) {
      closeAllNewsDetailImmediately();
    }

    setShowAllBreaking(true);
  }

  const closeAllNewsDetail = allNewsDetailExitMotion.closeWithMotion;

  return (
    <NewsRollCommonLayout
      aria-label="전체 뉴스"
      className={`newsroll_sheetFrame ${entryMotionClassName}`.trim()}
      dockedGap={pagePanelDockedGap}
      initialGap={pagePanelInitialGap}
      minInitialTop={allNewsMinInitialTop}
      lockSheetPosition={isDetailOpen}
      movingSheet
      onTouchCancelCapture={resetLatestTouchIntent}
      onTouchEndCapture={resetLatestTouchIntent}
      onTouchMoveCapture={isDetailOpen ? undefined : handleAllNewsTouchMove}
      onTouchStartCapture={isDetailOpen ? undefined : handleAllNewsTouchStart}
      onWheelCapture={isDetailOpen ? undefined : dockedPanelScroll.handleWheel}
      ref={screenRef}
      sheetClassName="newsroll_sheetFrameSheet container_homeSheet newsroll_all_sheetFrameSheet"
      sheetNestedScrollResetSelector={
        isDetailOpen
          ? homeDockedScrollSelectors.contentScroller
          : allNewsDockedScrollSelectors.contentScroller
      }
      sheetScrollSelector={
        isDetailOpen ? ".container_newsFeed_detail" : ".newsroll_all_feed"
      }
      top={
        <NewsRollHeaderTop>
          <NewsToolbar
            isTextLarge={isTextLarge}
            onOpenMenu={onOpenMenu}
            onOpenSearch={onOpenSearch}
            onToggleTextSize={onToggleTextSize}
          />
          <NewsRollDockedControls
            className="newsroll_motion_dockedPop newsroll_allDockedControls newsroll_panelHeaderRow"
            isDetailOpen={isDetailOpen}
          >
            {isDetailOpen ? (
              <NewsRollDetailBackButton
                ariaLabel="전체 뉴스 목록으로 돌아가기"
                onClick={closeAllNewsDetail}
              />
            ) : (
              <h1 className="text_panelHeaderTitle">전체 뉴스</h1>
            )}
            <Button
              aria-label="속보 알림"
              aria-pressed={false}
              className="newsroll_homeDockedAlarm"
              iconOnly
              onClick={showBreakingNewsList}
              radius="full"
              size="large"
              variant="outline"
            >
              <Icon name="alarm" />
            </Button>
          </NewsRollDockedControls>
          <div className="newsroll_all_breaking_label">
            <Icon name="alarm" />
            <span>속보</span>
          </div>
          <div className="newsroll_all_breakingBody" ref={breakingBodyRef}>
            <div className="newsroll_all_breaking_stack" id="all-breaking-news">
              {breakingItems.length > 0 ? (
                breakingItems.map((item) => (
                  <BreakingNewsCardLink
                    id={item.id}
                    key={item.id}
                    onClick={() => openAllNewsDetail(item.article)}
                    title={item.title}
                    updatedAt={item.updatedAt}
                    variant="list"
                  />
                ))
              ) : (
                <DataUnavailableMessage target="속보" />
              )}
            </div>
            <AllNewsMoreButton
              ariaLabel={showAllBreaking ? "속보 접기" : "속보 더보기"}
              expanded={showAllBreaking}
              onClick={() => setShowAllBreaking((current) => !current)}
              tone="dark"
            />
          </div>
        </NewsRollHeaderTop>
      }
    >
      {detailArticle ? (
        <ArticleDetailContent
          article={detailArticle}
          isLeaving={allNewsDetailExitMotion.isLeaving}
        />
      ) : (
        <section
          className="container_newsFeed newsroll_all_feed"
          aria-label="전체 뉴스 콘텐츠 영역"
          ref={feedRef}
        >
          <AllNewsSectionPanel
            ariaLabel="최신 뉴스"
            className="newsroll_all_latest_panel"
            headingLevel="h1"
            title={
              <>
                최신 뉴스 <strong>{allNewsLatestItems.length}</strong>
              </>
            }
          >
              <div
                aria-label="최신 뉴스 목록"
                className={`newsroll_all_latest_scroller${isLatestDragging ? " is_dragging" : ""}`}
                onPointerCancel={stopLatestDrag}
                onPointerDown={handleLatestPointerDown}
                onPointerLeave={stopLatestDrag}
                onPointerMove={handleLatestPointerMove}
                onPointerUp={stopLatestDrag}
                ref={latestScrollerRef}
                role="group"
              >
                {allNewsLatestItems.length > 0 ? (
                  allNewsLatestItems.map((item, index) => (
                    <AllNewsLatestCard
                      item={item}
                      key={`${item.title}-${index}`}
                      onClick={() => {
                        if (latestDidDragRef.current) {
                          return;
                        }

                        openAllNewsDetail(
                          createAllNewsArticle(item, item.category ?? homeArticle.category, index),
                        );
                      }}
                    />
                  ))
                ) : (
                  <DataUnavailableMessage target="전체 뉴스" />
                )}
              </div>
          </AllNewsSectionPanel>

          <AllNewsSectionPanel
            ariaLabel="언론사별 헤드라인"
            className="newsroll_all_press_panel"
            contentProps={{
              "aria-labelledby": `all-news-press-tab-${activePressIndex}`,
              id: "all-news-headline-panel",
              role: "tabpanel",
            }}
            title="언론사별 헤드라인"
          >
              <div className="newsroll_all_tabSticky newsroll_all_press_tabMenu">
                <div
                  className="newsroll_all_press_tabScroller"
                  role="tablist"
                  aria-label="언론사 선택"
                  onKeyDown={handlePressTabKeyDown}
                >
                  {visibleAllNewsPresses.map((press, index) => {
                    const selected = activePress === press;

                    return (
                      <Button
                        aria-controls="all-news-headline-panel"
                        aria-selected={selected}
                        className="tab tab_medium tab_filled tab_full_rounded newsroll_all_press_tabButton"
                        classNameOnly
                        id={`all-news-press-tab-${index}`}
                        key={press}
                        onClick={() => setActivePress(press)}
                        role="tab"
                        tabIndex={selected ? 0 : -1}
                        type="button"
                      >
                        <div
                          className="newsroll_all_press_logo"
                          aria-hidden="true"
                        />
                        <span>{press}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
              <div className="wrapper_allTabPanelBody">
                <SeparatedList
                  dividerClassName="newsroll_all_itemDivider"
                  getKey={(item, index) => `${item.title}-${index}`}
                  items={headlineItems}
                  renderItem={(item, index) => (
                    <AllNewsHeadlineItem
                      item={item}
                      onClick={() =>
                        openAllNewsDetail(
                          createAllNewsArticle(item, activePress, index),
                        )
                      }
                    />
                  )}
                />
                {headlineItems.length === 0 ? (
                  <DataUnavailableMessage target="언론사별 헤드라인" />
                ) : (
                  <AllNewsMoreButton
                    ariaLabel={
                      showAllHeadlines
                        ? "언론사별 헤드라인 접기"
                        : "언론사별 헤드라인 더보기"
                    }
                    expanded={showAllHeadlines}
                    onClick={() => setShowAllHeadlines((current) => !current)}
                  />
                )}
              </div>
          </AllNewsSectionPanel>

          <AllNewsSectionPanel
            ariaLabel="릴레이 뉴스"
            className="newsroll_all_relay_panel"
            contentProps={{
              "aria-labelledby": `all-news-relay-tab-${activeRelayIndex}`,
              id: `all-news-relay-panel-${activeRelayIndex}`,
              role: "tabpanel",
            }}
            title="릴레이 뉴스"
          >
              <div className="newsroll_all_tabSticky newsroll_all_category_tabSticky">
                <PillTabMenu
                  ariaLabel="릴레이 뉴스 카테고리"
                  className="newsroll_all_category_tabs"
                  getPanelId={(category) =>
                    category === activeRelayCategory
                      ? `all-news-relay-panel-${visibleAllNewsRelayCategories.indexOf(category)}`
                      : undefined
                  }
                  getTabId={(category) =>
                    `all-news-relay-tab-${visibleAllNewsRelayCategories.indexOf(category)}`
                  }
                  items={visibleAllNewsRelayCategories.map((category) => ({
                    id: category,
                    label: category,
                  }))}
                  onChange={setActiveRelayCategory}
                  value={activeRelayCategory}
                />
              </div>
              <div className="wrapper_allTabPanelBody">
                <SeparatedList
                  dividerClassName="newsroll_all_itemDivider"
                  getKey={(item, index) => `${item.title}-${index}`}
                  items={relayItems}
                  renderItem={(item, index) => (
                    <AllNewsRelayItem
                      featured={index === 0 || index === 5}
                      item={item}
                      onClick={() =>
                        openAllNewsDetail(
                          createAllNewsArticle(item, activeRelayCategory, index),
                        )
                      }
                    />
                  )}
                />
                {relayItems.length === 0 ? (
                  <DataUnavailableMessage target="릴레이 뉴스" />
                ) : null}
              </div>
          </AllNewsSectionPanel>
        </section>
      )}
    </NewsRollCommonLayout>
  );
}

const policyAgeTabs = ["전체", "미성년", "청년", "중장년", "노년"];
const policyAgeIdByLabel: Record<string, string> = {
  노년: "senior",
  미성년: "minor",
  전체: "all",
  중장년: "middle",
  청년: "youth",
};
const basePolicyDetails: PolicyDetailItem[] = [
  { label: "지원 대상 연령", value: "19세 ~ 45세" },
  {
    label: "지원 내용",
    value:
      "동아리 활동에 필요한 강사비, 교재비, 재료비 등 운영비 지원 (팀당 약 150만원).",
  },
  { label: "지원 기관", value: "경상남도 하동군 지역활력추진단" },
  { label: "사업 기간", value: "2026-01 ~ 2026-12" },
  { label: "신청 기간", value: "2025-10-01 ~ 2025-10-10" },
  {
    label: "신청 방법",
    value: "양산시 청년 정보 플랫폼 청년카까 온라인 신청.",
  },
  {
    label: "선발 방식",
    value: "지원 자격 충족자 대상 선착순 선정 후 개별 통보.",
  },
  {
    label: "제출 서류",
    value:
      "사업자등록 사실 여부 증명서, 시험 응시 확인 서류, 응시료 결제 영수증, 통장 사본 등.",
  },
];
const policyItemsByAge: Record<string, PolicyItem[]> = {
  전체: [
    {
      title: "청년동아리 활동비 지원사업",
      tags: ["복지문화", "문화활동", "바우처"],
      summary:
        "청년 비율이 50% 이상인 5인 이상의 동아리를 대상으로 활동비를 지원하는 사업.",
      registeredAt: "2026년 12월 31일",
      updatedAt: "2026년 12월 31일",
      details: basePolicyDetails,
    },
    {
      title: "양산시 청년 자격증 응시료 지원",
      tags: ["일자리", "취업", "보조금"],
      summary:
        "취업 준비 청년의 자격증 응시료 부담을 낮추기 위한 지역 지원 정책.",
      registeredAt: "2026년 12월 31일",
      updatedAt: "2027년 1월 3일",
      details: basePolicyDetails,
    },
  ],
  미성년: [
    {
      title: "청소년 문화예술 체험 바우처",
      tags: ["복지문화", "청소년", "바우처"],
      summary:
        "미성년 청소년의 문화예술 관람과 체험 활동 비용을 지원하는 사업.",
      registeredAt: "2026년 12월 20일",
      updatedAt: "2026년 12월 28일",
      details: [
        { label: "지원 대상 연령", value: "13세 ~ 18세" },
        ...basePolicyDetails.slice(1),
      ],
    },
    {
      title: "방과후 학습 돌봄 지원",
      tags: ["교육", "돌봄", "지원금"],
      summary:
        "방과후 학습과 돌봄이 필요한 청소년 가구에 프로그램 이용료를 지원.",
      registeredAt: "2026년 12월 18일",
      updatedAt: "2026년 12월 29일",
      details: [
        { label: "지원 대상 연령", value: "8세 ~ 18세" },
        ...basePolicyDetails.slice(1),
      ],
    },
  ],
  청년: [
    {
      title: "청년동아리 활동비 지원사업",
      tags: ["복지문화", "문화활동", "바우처"],
      summary:
        "청년 비율이 50% 이상인 5인 이상의 동아리를 대상으로 활동비를 지원하는 사업.",
      registeredAt: "2026년 12월 31일",
      updatedAt: "2026년 12월 31일",
      details: basePolicyDetails,
    },
    {
      title: "청년 주거 지원 확대 논의",
      tags: ["주거", "청년", "보조금"],
      summary:
        "청년 주거비 부담을 낮추기 위해 지자체별 신청 조건을 정비하는 정책.",
      registeredAt: "2026년 12월 27일",
      updatedAt: "2026년 12월 30일",
      details: basePolicyDetails,
    },
  ],
  중장년: [
    {
      title: "중장년 재취업 역량 강화 과정",
      tags: ["일자리", "교육", "재취업"],
      summary: "경력 전환을 준비하는 중장년층에게 직무 교육과 상담을 제공.",
      registeredAt: "2026년 12월 24일",
      updatedAt: "2026년 12월 30일",
      details: [
        { label: "지원 대상 연령", value: "40세 ~ 64세" },
        ...basePolicyDetails.slice(1),
      ],
    },
    {
      title: "소상공인 전환 컨설팅 지원",
      tags: ["경제", "창업", "컨설팅"],
      summary:
        "업종 전환과 매장 운영 개선이 필요한 중장년 소상공인 대상 컨설팅 지원.",
      registeredAt: "2026년 12월 21일",
      updatedAt: "2026년 12월 29일",
      details: [
        { label: "지원 대상 연령", value: "35세 ~ 64세" },
        ...basePolicyDetails.slice(1),
      ],
    },
  ],
  노년: [
    {
      title: "노년층 디지털 생활 교육",
      tags: ["교육", "복지", "디지털"],
      summary:
        "스마트폰, 공공앱, 금융앱 사용에 어려움을 겪는 노년층을 위한 교육.",
      registeredAt: "2026년 12월 22일",
      updatedAt: "2026년 12월 30일",
      details: [
        { label: "지원 대상 연령", value: "65세 이상" },
        ...basePolicyDetails.slice(1),
      ],
    },
    {
      title: "어르신 건강 돌봄 방문 서비스",
      tags: ["건강", "복지", "방문지원"],
      summary: "거동이 불편한 노년층에게 정기 건강 확인과 생활 상담을 제공.",
      registeredAt: "2026년 12월 19일",
      updatedAt: "2026년 12월 28일",
      details: [
        { label: "지원 대상 연령", value: "70세 이상" },
        ...basePolicyDetails.slice(1),
      ],
    },
  ],
};
const policySortLabels: Record<SortOrder, string> = {
  latest: "최신순",
  popular: "인기순",
};
const policySortOptions: { label: string; value: SortOrder }[] = [
  { label: policySortLabels.popular, value: "popular" },
  { label: policySortLabels.latest, value: "latest" },
];
const policyListTargetCount = 10;

function formatPolicyDate(value: string) {
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

function getPolicyItemFromWelfarePolicy(policy: WelfarePolicy): PolicyItem {
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
    registeredAt: formatPolicyDate(policy.registeredAt),
    summary: policy.summary,
    tags: [policy.category, policy.subcategory, policy.label],
    title: policy.title,
    updatedAt: formatPolicyDate(policy.updatedAt),
  };
}

function fillPolicyListItems(items: PolicyItem[]) {
  if (items.length === 0 || items.length >= policyListTargetCount) {
    return items;
  }

  return Array.from(
    { length: policyListTargetCount },
    (_, index) => items[index % items.length],
  );
}

function getPolicyDateDisplay(item: PolicyItem) {
  const isUpdated = item.registeredAt !== item.updatedAt;

  return {
    date: isUpdated ? item.updatedAt : item.registeredAt,
    label: isUpdated ? "최종수정" : "최초등록",
  };
}

function PolicyListItem({
  isSelected,
  item,
  onSelect,
}: {
  isSelected: boolean;
  item: PolicyItem;
  onSelect: () => void;
}) {
  const policyDate = getPolicyDateDisplay(item);

  return (
    <button
      aria-pressed={isSelected}
      className={`newsroll_policy_list_item${isSelected ? " is_selected" : ""}`}
      onClick={onSelect}
      type="button"
    >
      <div className="newsroll_policy_list_tags">
        {item.tags.map((tag, index) => (
          <ChipLabel
            kind={index === 2 ? "policyAccent" : "policy"}
            key={`${item.title}-${tag}`}
          >
            {tag}
          </ChipLabel>
        ))}
      </div>
      <div className="wrapper_policyItemContent">
        <h2>{item.title}</h2>
        <p className="text_infoBody text_lineClamp2">{item.summary}</p>
        <div className="newsroll_policy_dates">
          <span>
            <strong>{policyDate.label}</strong>
            {policyDate.date}
          </span>
        </div>
      </div>
    </button>
  );
}

function PolicyDetailContent({
  hideDetailList = false,
  hideDetailToggle = false,
  isLeaving = false,
  item,
  onNextItem,
  onPreviousItem,
}: {
  hideDetailList?: boolean;
  hideDetailToggle?: boolean;
  isLeaving?: boolean;
  item: PolicyItem;
  onNextItem?: () => void;
  onPreviousItem?: () => void;
}) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const policyDate = getPolicyDateDisplay(item);

  useLayoutEffect(() => {
    resetNewsRollViewport();
  }, []);

  return (
    <div
      className={`newsroll_policy_detail_content ${getEnterFromRightMotionClassName(isLeaving)}`}
    >
      <div className="newsroll_policy_detail_tags">
        {item.tags.map((tag, index) => (
          <ChipLabel
            kind={index === item.tags.length - 1 ? "policyAccent" : "policy"}
            key={`${item.title}-${tag}`}
          >
            {tag}
          </ChipLabel>
        ))}
      </div>

      <div className="newsroll_policy_detail_body">
        <h1>{item.title}</h1>
        <div className="newsroll_policy_detail_dates">
          <span>
            <strong>{policyDate.label}</strong>
            {policyDate.date}
          </span>
        </div>
      </div>

      <ArticleActionButtons
        ariaLabel="정책 도구"
        isBookmarked={isBookmarked}
        isShared={isShared}
        onBookmark={() => setIsBookmarked((current) => !current)}
        onShare={() => setIsShared((current) => !current)}
      />

      <NewsRollDivider className="newsroll_policy_detail_actions_divider" />

      <p className="newsroll_policy_detail_summary">{item.summary}</p>

      {hideDetailList ? null : (
        <dl className="newsroll_policy_detail_list">
          {item.details.map((detail) => (
            <div key={`${item.title}-${detail.label}`}>
              <dt>{detail.label}</dt>
              <dd>{detail.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {hideDetailToggle ? null : (
        <Button
          className="newsroll_policy_detail_toggle"
          size="large"
          variant="filled"
        >
          <Icon name="plus" />
          상세보기
        </Button>
      )}

      <div
        className="newsroll_policy_detail_pagination"
        role="group"
        aria-label="이전글 다음글"
      >
        <Button
          className="btn_originalArticle newsroll_policy_detail_page_button"
          classNameOnly
          disabled={!onPreviousItem}
          onClick={onPreviousItem}
          type="button"
        >
          <Icon name="arrow" />
          이전글
        </Button>
        <Button
          className="btn_originalArticle newsroll_policy_detail_page_button"
          classNameOnly
          disabled={!onNextItem}
          onClick={onNextItem}
          type="button"
        >
          다음글
          <Icon name="arrow" />
        </Button>
      </div>
    </div>
  );
}

function getEnterFromRightMotionClassName(isLeaving = false) {
  return `newsroll_motion_enterFromRight${isLeaving ? " is_motionLeaving" : ""}`;
}

function hasActiveEnterFromRightMotion() {
  return Boolean(document.querySelector(".newsroll_motion_enterFromRight"));
}

function requestEnterFromRightExitMotion() {
  window.dispatchEvent(new Event(detailExitMotionEventName));
}

function useEnterFromRightExitMotion({
  isOpen,
  listenForGlobalExit = true,
  onClose,
}: {
  isOpen: boolean;
  listenForGlobalExit?: boolean;
  onClose: () => void;
}) {
  const [isLeaving, setIsLeaving] = useState(false);
  const closeRef = useRef(onClose);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  const clearExitTimer = useCallback(() => {
    if (timeoutRef.current === null) {
      return;
    }

    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  const closeWithMotion = useCallback(() => {
    if (!isOpen) {
      closeRef.current();
      return;
    }

    if (timeoutRef.current !== null) {
      return;
    }

    setIsLeaving(true);
    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null;
      setIsLeaving(false);
      closeRef.current();
    }, nextArticleRevealDelayMs);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      return;
    }

    clearExitTimer();
    setIsLeaving(false);
  }, [clearExitTimer, isOpen]);

  useEffect(() => {
    if (!listenForGlobalExit || !isOpen) {
      return;
    }

    window.addEventListener(detailExitMotionEventName, closeWithMotion);

    return () => {
      window.removeEventListener(detailExitMotionEventName, closeWithMotion);
    };
  }, [closeWithMotion, isOpen, listenForGlobalExit]);

  useEffect(() => clearExitTimer, [clearExitTimer]);

  return {
    closeWithMotion,
    isLeaving,
  };
}

function PolicyView({
  isTextLarge,
  onOpenBreakingNews,
  onOpenMenu,
  onOpenSearch,
  onToggleTextSize,
}: {
  isTextLarge: boolean;
  onOpenBreakingNews: () => void;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  onToggleTextSize: () => void;
}) {
  const [activeAge, setActiveAge] = useState(policyAgeTabs[0]);
  const [detailItem, setDetailItem] = useState<PolicyItem | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("popular");
  const [isPolicySortOpen, setIsPolicySortOpen] = useState(false);
  const [selectedPolicyIndex, setSelectedPolicyIndex] = useState(0);
  const [policyApiItems, setPolicyApiItems] = useState<PolicyItem[]>([]);
  const [policyTotalCount, setPolicyTotalCount] = useState(0);
  const [policyLoadFailed, setPolicyLoadFailed] = useState(false);
  const policyPanelContentRef = useRef<HTMLDivElement>(null);
  const policyListSectionRef = useRef<HTMLDivElement>(null);
  const policyItems = fillPolicyListItems(policyApiItems);
  const visiblePolicyItems =
    sortOrder === "latest" ? [...policyItems].reverse() : policyItems;
  const activeAgeIndex = Math.max(0, policyAgeTabs.indexOf(activeAge));
  const detailItemIndex = detailItem
    ? visiblePolicyItems.findIndex((item) => item.title === detailItem.title)
    : -1;
  const previousPolicyItem =
    detailItemIndex > 0 ? visiblePolicyItems[detailItemIndex - 1] : null;
  const nextPolicyItem =
    detailItemIndex >= 0 && detailItemIndex < visiblePolicyItems.length - 1
      ? visiblePolicyItems[detailItemIndex + 1]
      : null;
  const isPolicyDetailOpen = detailItem !== null;
  const policyDetailScrollRestore = useDetailScrollRestore({
    isDetailOpen: isPolicyDetailOpen,
    scrollerRef: policyPanelContentRef,
  });
  const closePolicyDetailImmediately = useCallback(() => {
    policyDetailScrollRestore.requestRestore();
    setDetailItem(null);
  }, [policyDetailScrollRestore]);
  const policyDetailExitMotion = useEnterFromRightExitMotion({
    isOpen: isPolicyDetailOpen,
    onClose: closePolicyDetailImmediately,
  });
  const policySortMenuId = "policy-sort-menu";

  useEffect(() => {
    let ignore = false;

    async function loadPolicies() {
      setPolicyLoadFailed(false);
      const ageGroupId = policyAgeIdByLabel[activeAge] ?? "all";
      const [nextPolicies, allPolicies] = await Promise.all([
        welfareApi.getWelfarePolicyList(ageGroupId),
        welfareApi.getWelfarePolicyList("all"),
      ]);

      if (!ignore) {
        setPolicyApiItems(nextPolicies.map(getPolicyItemFromWelfarePolicy));
        setPolicyTotalCount(allPolicies.length);
        setSelectedPolicyIndex(0);
      }
    }

    loadPolicies().catch(() => {
      if (!ignore) {
        setPolicyApiItems([]);
        setPolicyTotalCount(0);
        setPolicyLoadFailed(true);
      }
    });

    return () => {
      ignore = true;
    };
  }, [activeAge]);

  function openPolicyDetail(item: PolicyItem, index: number) {
    if (!detailItem) {
      policyDetailScrollRestore.captureScroll();
    }

    setSelectedPolicyIndex(index);
    setDetailItem(item);
  }

  const closePolicyDetail = policyDetailExitMotion.closeWithMotion;

  useEffect(() => {
    if (!isPolicySortOpen) {
      return;
    }

    function closePolicySortOnPointerDown(event: globalThis.PointerEvent) {
      const target = event.target;

      if (
        target instanceof Node &&
        policyListSectionRef.current?.contains(target)
      ) {
        return;
      }

      setIsPolicySortOpen(false);
    }

    function closePolicySortOnEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setIsPolicySortOpen(false);
      }
    }

    document.addEventListener("pointerdown", closePolicySortOnPointerDown);
    document.addEventListener("keydown", closePolicySortOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closePolicySortOnPointerDown);
      document.removeEventListener("keydown", closePolicySortOnEscape);
    };
  }, [isPolicySortOpen]);

  return (
    <NewsRollCommonLayout
      aria-label="국가정책"
      className="newsroll_sheetFrame newsroll_policy_screen"
      dockedGap={pagePanelDockedGap}
      initialGap={pagePanelInitialGap}
      minInitialTop={pagePanelInitialTop}
      movingSheet
      sheetClassName="newsroll_sheetFrameSheet container_homeSheet newsroll_policy_sheet"
      sheetScrollSelector={pagePanelContentSelector}
      top={
        <NewsRollSummaryHeroTop
          controls={
            <NewsRollDockedControls
              className="newsroll_motion_dockedPop newsroll_allDockedControls newsroll_panelHeaderRow"
              isDetailOpen={isPolicyDetailOpen}
            >
              {isPolicyDetailOpen ? (
                <NewsRollDetailBackButton
                  ariaLabel="국가정책 목록으로 돌아가기"
                  onClick={closePolicyDetail}
                />
              ) : (
                <h1 className="text_panelHeaderTitle">국가정책</h1>
              )}
              <DockedAlarmButton
                isPressed={false}
                onClick={onOpenBreakingNews}
              />
            </NewsRollDockedControls>
          }
          toolbar={
            <NewsToolbar
              isTextLarge={isTextLarge}
              onOpenMenu={onOpenMenu}
              onOpenSearch={onOpenSearch}
              onToggleTextSize={onToggleTextSize}
            />
          }
          hero={{
            ariaLabel: "맞춤 정책 요약",
            caption: "국가정책 정보가 있습니다.",
            className: "newsroll_policy_hero",
            count: formatHeroCount(policyTotalCount),
            greeting: "콩콩이님을 위한",
            unit: "개",
          }}
        />
      }
    >
      <NewsRollPagePanel
        ariaLabel="국가정책 콘텐츠 영역"
        contentRef={policyPanelContentRef}
        key={detailItem ? `policy-detail-${detailItem.title}` : "policy-list"}
      >
        {detailItem ? (
          <PolicyDetailContent
            isLeaving={policyDetailExitMotion.isLeaving}
            item={detailItem}
            onNextItem={
              nextPolicyItem
                ? () => openPolicyDetail(nextPolicyItem, detailItemIndex + 1)
                : undefined
            }
            onPreviousItem={
              previousPolicyItem
                ? () => openPolicyDetail(previousPolicyItem, detailItemIndex - 1)
                : undefined
            }
          />
        ) : (
          <div className="newsroll_policy_listContent">
            <PillTabMenu
              ariaLabel="연령 필터"
              className="newsroll_all_category_tabs newsroll_policy_age_tabs"
              getPanelId={() => "policy-list-panel"}
              getTabId={(age) => `policy-age-tab-${policyAgeTabs.indexOf(age)}`}
              items={policyAgeTabs.map((label) => ({ id: label, label }))}
              onChange={(nextAge) => {
                setActiveAge(nextAge);
                setIsPolicySortOpen(false);
                setSelectedPolicyIndex(0);
              }}
              value={activeAge}
            />

            <div
              aria-labelledby={`policy-age-tab-${activeAgeIndex}`}
              className="newsroll_policy_listSection"
              id="policy-list-panel"
              ref={policyListSectionRef}
              role="tabpanel"
            >
              <button
                aria-controls={isPolicySortOpen ? policySortMenuId : undefined}
                aria-expanded={isPolicySortOpen}
                aria-haspopup="listbox"
                aria-label="정책 정렬"
                className="btn_commentDropdown newsroll_policy_sort"
                onClick={() => setIsPolicySortOpen((current) => !current)}
                type="button"
              >
                {policySortLabels[sortOrder]}
                <NewsRollDropdownArrow />
              </button>
              {isPolicySortOpen ? (
                <div
                  className="listbox_commentDropdown newsroll_policy_sortListbox"
                  id={policySortMenuId}
                  role="listbox"
                >
                  {policySortOptions.map((option) => (
                    <button
                      aria-selected={sortOrder === option.value}
                      key={option.value}
                      onClick={() => {
                        setSortOrder(option.value);
                        setIsPolicySortOpen(false);
                      }}
                      role="option"
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="newsroll_policy_items">
                {policyLoadFailed ? (
                  <DataUnavailableMessage target="국가정책" />
                ) : (
                  <SeparatedList
                    dividerClassName="newsroll_policy_itemDivider"
                    getKey={(item, index) =>
                      `${activeAge}-${sortOrder}-${item.title}-${index}`
                    }
                    items={visiblePolicyItems}
                    renderItem={(item, index) => (
                      <PolicyListItem
                        isSelected={selectedPolicyIndex === index}
                        item={item}
                        onSelect={() => openPolicyDetail(item, index)}
                      />
                    )}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </NewsRollPagePanel>
    </NewsRollCommonLayout>
  );
}
const myRecentNews = Array.from({ length: 12 }, (_, index) => ({
  dateTime: defaultNewsDateTime,
  image: articleImage,
  time: defaultNewsDateLabel,
  title:
    index % 2 === 0
      ? "용인 수지, 강남·분당 가격 동조화로..."
      : "용인 수지, 강남·분당 가격 동조화로...",
}));
type MyRecentSummaryItem = (typeof myRecentNews)[number] & {
  article: HomeArticle;
};
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
    active: new Set(["미성년"]),
  },
  {
    items: ["중앙일보", "국민일보", "중앙일보"],
    title: "관심 언론사 설정",
    active: new Set<string>(),
  },
];

function getMyCategoryOptionId(groupIndex: number, itemIndex: number) {
  return `${groupIndex}-${itemIndex}`;
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
  const ageGroupIds = getValidOptionIds(1, preference.ageGroupId ? [preference.ageGroupId] : []);
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
    "내 댓글에 좋아요, 답글": settings?.commentReplies ?? true,
    "공지사항": settings?.notices ?? true,
  };
}

function getNewsViewTimesFromApi(settings: UserNewsViewTime | null) {
  return new Set(settings?.times?.length ? settings.times : ["07:00", "21:00"]);
}

function getBlockedKeywordSettingsFromApi(
  items: BlockedKeywordPreference[],
): BlockedKeywordSetting[] {
  return items.map((item) => ({
    id: item.id,
    isActive: item.isActive,
    keyword: item.keyword,
  }));
}

const mySummaryItems = [
  { count: 56, icon: "bookmark", label: "북마크", tone: "like", value: "bookmark" },
  { count: 54, icon: "vote", label: "투표", tone: "dislike", value: "vote" },
  { count: 15, icon: "chat", label: "댓글", tone: "neutral", value: "comment" },
] as const;
const myNotificationLabels = ["속보", "내 댓글에 좋아요, 답글", "공지사항"] as const;
type MySummaryView = (typeof mySummaryItems)[number]["value"];
type MyPageDetailView =
  | "recent"
  | "customNewsSettings"
  | "newsViewTime"
  | "profileSettings"
  | MySummaryView
  | null;

function BlockedKeywordDialog({
  onCancel,
  onInputChange,
  onSave,
  value,
}: {
  onCancel: () => void;
  onInputChange: (value: string) => void;
  onSave: () => void;
  value: string;
}) {
  useEffect(() => {
    function closeOnEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [onCancel]);

  return (
    <ClientPortal>
      <div
        className="container_myKeywordOverlay"
        onClick={onCancel}
        role="presentation"
      >
        <section
          aria-labelledby="my-blocked-keyword-dialog-title"
          aria-modal="true"
          className="container_myKeywordDialog"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
        >
          <h2
            className="text_myKeywordDialogTitle"
            id="my-blocked-keyword-dialog-title"
          >
            가리고 싶은 키워드
          </h2>
          <form
            className="form_myKeywordDialog"
            onSubmit={(event) => {
              event.preventDefault();
              onSave();
            }}
          >
            <div className="wrapper_myKeywordInput">
              <TextInput
                aria-label="가리고 싶은 키워드 입력"
                onChange={(event) => onInputChange(event.target.value)}
                placeholder="키워드를 입력해주세요"
                inputSize="large"
                radius="rounded"
                type="text"
                value={value}
                variant="outline"
                wrapperClassName="input_commentComposer"
              />
            </div>
            <div className="wrapper_commentEditActions">
              <Button
                className="btn_commentEditSave"
                radius="rounded"
                size="large"
                type="submit"
                variant="filled"
              >
                저장
              </Button>
              <Button
                className="btn_commentEditCancel"
                onClick={onCancel}
                radius="rounded"
                size="large"
                type="button"
                variant="filled"
              >
                취소
              </Button>
            </div>
          </form>
        </section>
      </div>
    </ClientPortal>
  );
}

function BlockedKeywordSettingsSection({
  blockedKeywordSettings,
  inputValue,
  isDialogOpen,
  onCancelDialog,
  onInputChange,
  onKeywordDelete,
  onKeywordToggle,
  onOpenDialog,
  onSaveKeyword,
}: {
  blockedKeywordSettings: BlockedKeywordSetting[];
  inputValue: string;
  isDialogOpen: boolean;
  onCancelDialog: () => void;
  onInputChange: (value: string) => void;
  onKeywordDelete: (keyword: string) => void;
  onKeywordToggle: (keyword: string) => void;
  onOpenDialog: () => void;
  onSaveKeyword: () => void;
}) {
  const keywordTabs = blockedKeywordSettings.map((setting) => ({
    id: setting.keyword,
    label: setting.keyword,
  }));

  return (
    <section
      aria-label="가리고 싶은 키워드 설정"
      className="container_myBlockedKeywordSection"
    >
      <h2 className="text_mySectionTitle">가리고 싶은 키워드</h2>
      <p className="text_myBlockedKeywordDescription">
        맞춤 뉴스, 전체 뉴스에 모두 적용되며 해당 키워드를 가진 뉴스는 검색되지 않습니다.
      </p>
      <div
        aria-label="등록된 가리고 싶은 키워드"
        className="wrapper_myBlockedKeywordChips"
        role="group"
      >
        <div className="wrapper_myBlockedKeywordTabs">
          {keywordTabs.length > 0 ? (
            <PillTabMenu
              ariaLabel="가리고 싶은 키워드"
              className="tab_myCategoryMenu tab_myBlockedKeywordMenu"
              getItemState={(keyword) =>
                blockedKeywordSettings.find((setting) => setting.keyword === keyword)?.isActive
                  ? "active"
                  : "default"
              }
              getItemWrapperClassName={() => "wrapper_myBlockedKeywordTab"}
              items={keywordTabs}
              keyboardNavigation={false}
              onChange={onKeywordToggle}
              renderItemAddon={(item, state) =>
                state === "default" ? (
                  <button
                    aria-label={`${item.label} 키워드 삭제`}
                    className="btn_myBlockedKeywordDelete"
                    onClick={() => onKeywordDelete(item.id)}
                    type="button"
                  >
                    <span aria-hidden="true" />
                  </button>
                ) : null
              }
              role="group"
              value={keywordTabs[0]?.id ?? ""}
            />
          ) : null}
        </div>
        <button
          aria-label="가리고 싶은 키워드 추가"
          className="btn_myBlockedKeywordAdd"
          onClick={onOpenDialog}
          type="button"
        >
          <Icon name="plus" />
        </button>
      </div>
      {isDialogOpen ? (
        <BlockedKeywordDialog
          onCancel={onCancelDialog}
          onInputChange={onInputChange}
          onSave={onSaveKeyword}
          value={inputValue}
        />
      ) : null}
    </section>
  );
}

const mySummaryAllTabLabel = "전체";
const mySummaryListCount = 5;
const myVotePercents = [64, 48, 72, 57, 81];
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

function isMySummaryAllCategory(category: string) {
  return category === mySummaryAllTabLabel;
}

function getMySummaryItemsByCategory<T extends { category: string }>(
  items: T[],
  category: string,
) {
  return isMySummaryAllCategory(category)
    ? items
    : items.filter((item) => item.category === category);
}

const myVoteItems = allNewsLatest.map((item, index) => ({
  article: createAllNewsArticle(item, item.category, index),
  category: item.category,
  headline: item,
  isBinary: false,
  percent: myVotePercents[index % myVotePercents.length],
  pollTitle: item.title,
  selectedOption: guideOptions[index % guideOptions.length],
  title: item.title,
}));
const myVoteCategoryTabs = getMySummaryCategoryTabs(myVoteItems);
type MyBookmarkSummaryItem = AllNewsArticlePreview & { category: string };
type MyVoteSummaryItem = (typeof myVoteItems)[number];
type MyCommentKind = (typeof myCommentTabs)[number]["id"];
const myCommentItems = Array.from({ length: mySummaryListCount }, (_, index) => {
  const press = allNewsPresses[index % allNewsPresses.length];
  const fallbackHeadlines = allNewsHeadlinesByPress[allNewsPresses[0]] ?? [];
  const item =
    allNewsHeadlinesByPress[press]?.[index] ??
    fallbackHeadlines[index] ??
    fallbackHeadlines[0] ??
    allNewsLatest[0];
  const commentTemplate = commentTemplates[index % commentTemplates.length];

  return {
    article: createAllNewsArticle(item, press, index),
    category: press,
    comment: {
      ...commentTemplate,
      choice: guideOptions[index % guideOptions.length],
      replies: 3,
    },
    commentKind: "comment" as const,
    headline: item,
    targetCommentId: commentTemplate.id,
  };
});
type MyCommentSummaryItem = (typeof myCommentItems)[number] & {
  commentKind: Exclude<MyCommentKind, "all">;
  targetCommentId: CommentId;
};

function hasMultipleMySummaryCategories(items: { category: string }[]) {
  return getUniqueValues(items.map((item) => item.category)).length > 1;
}

function hasMultipleMyCommentKinds(items: { commentKind: Exclude<MyCommentKind, "all"> }[]) {
  return getUniqueValues(items.map((item) => item.commentKind)).length > 1;
}

type MySettingRowProps = {
  checked?: boolean;
  label: string;
  onClick?: () => void;
  showChevron?: boolean;
};

function MySettingRow({
  checked,
  label,
  onClick,
  showChevron = false,
}: MySettingRowProps) {
  const className = `btn_mySettingRow${showChevron ? " btn_mySettingRowLink" : ""}`;

  return (
    <button
      aria-pressed={checked}
      className={className}
      onClick={onClick}
      type="button"
    >
      <span className="text_mySettingLabel">{label}</span>
      {typeof checked === "boolean" ? <NewsRollSwitch checked={checked} /> : null}
      {showChevron ? <span className="icon_myChevron" aria-hidden="true" /> : null}
    </button>
  );
}

function createMyRecentArticle(
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

function MyRecentDetailPage({
  items,
  isLeaving = false,
  onOpenArticle,
}: {
  items: MyRecentSummaryItem[];
  isLeaving?: boolean;
  onOpenArticle: OpenArticleDetail;
}) {
  return (
    <div
      className={`container_myBookmarkPage ${getEnterFromRightMotionClassName(isLeaving)}`}
    >
      <h2 className="text_mySectionTitle">최근 본 뉴스</h2>
      {items.length === 0 ? (
        <DataUnavailableMessage target="최근 본 뉴스" />
      ) : (
        <SeparatedList
          dividerClassName="newsroll_all_itemDivider"
          getKey={(item, index) => `${item.title}-${index}`}
          items={items}
          renderItem={(item, index) => (
            <AllNewsRelayItem
              featured={index === 0 || index === 5}
              item={item}
              onClick={() => onOpenArticle(createMyRecentArticle(item, index))}
            />
          )}
        />
      )}
    </div>
  );
}

function MyBookmarkDetailPage({
  activeCategory,
  items,
  isLeaving = false,
  onCategoryChange,
  onOpenArticle,
  showTabs,
  tabs,
}: {
  activeCategory: string;
  items: MyBookmarkSummaryItem[];
  isLeaving?: boolean;
  onCategoryChange: (category: string) => void;
  onOpenArticle: OpenArticleDetail;
  showTabs: boolean;
  tabs: string[];
}) {
  const visibleBookmarkItems = getMySummaryItemsByCategory(
    items,
    activeCategory,
  );

  return (
    <div
      className={`container_myBookmarkPage ${getEnterFromRightMotionClassName(isLeaving)}`}
    >
      <h2 className="text_mySectionTitle">북마크</h2>
      {showTabs ? (
        <PillTabMenu
          ariaLabel="북마크 뉴스 카테고리"
          className="tab_myCategoryMenu"
          items={tabs.map((category) => ({
            id: category,
            label: category,
          }))}
          onChange={onCategoryChange}
          value={activeCategory}
        />
      ) : null}
      {visibleBookmarkItems.length === 0 ? (
        <DataUnavailableMessage target="북마크" />
      ) : (
        <SeparatedList
          dividerClassName="newsroll_all_itemDivider"
          getKey={(item, index) => `${item.title}-${index}`}
          items={visibleBookmarkItems}
          renderItem={(item, index) => (
            <AllNewsRelayItem
              featured={index === 0 || index === 5}
              item={item}
              onClick={() =>
                onOpenArticle(createAllNewsArticle(item, item.category, index))
              }
            />
          )}
        />
      )}
    </div>
  );
}

function MyVoteDetailPage({
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
  const visibleVoteItems = getMySummaryItemsByCategory(
    items,
    activeCategory,
  );

  return (
    <div
      className={`container_myVotePage ${getEnterFromRightMotionClassName(isLeaving)}`}
    >
      <h2 className="text_mySectionTitle">투표</h2>
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
                  isSelected
                  label={item.selectedOption}
                  onClick={() =>
                    onOpenArticle(item.article, { scrollTarget: "poll" })
                  }
                  percent={item.percent}
                  showResult
                  variant={item.isBinary ? "binary" : "stacked"}
                />
              </article>
            )}
          />
        )}
      </div>
    </div>
  );
}

function MyCommentCreatedDate({
  children,
  dateTime = defaultNewsDateTime,
}: {
  children: ReactNode;
  dateTime?: string;
}) {
  return (
    <time className="text_myCommentCreatedDate" dateTime={dateTime}>
      {children}
    </time>
  );
}

function MyCommentPreviewThread({
  comment,
  instanceId,
  onOpenComment,
}: {
  comment: CommentItem;
  instanceId: string;
  onOpenComment: () => void;
}) {
  const replyToggleId = `${instanceId}-reply-toggle-${comment.id}`;
  const replyListId = `${instanceId}-reply-list-${comment.id}`;
  const commentReplies: CommentReplyItem[] = Array.from(
    { length: Math.min(comment.replies, 3) },
    (_, replyIndex) => ({
      ...commentReplyTemplates[replyIndex % commentReplyTemplates.length],
      id: `${comment.id}-${replyIndex}`,
    }),
  );
  const likeCount = comment.likes;
  const dislikeCount = comment.dislikes;

  function openCommentFromControl(event: MouseEvent<HTMLElement>) {
    event.stopPropagation();
    onOpenComment();
  }

  function openCommentFromKeyboard(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    onOpenComment();
  }

  return (
    <article
      aria-label="댓글이 달린 기사 본문으로 이동"
      className="wrapper_commentItem wrapper_myPageCommentThread"
      id={`${instanceId}-comment-${comment.id}`}
      onClick={onOpenComment}
      onKeyDown={openCommentFromKeyboard}
      tabIndex={0}
    >
      <ChipLabel kind="commentChoice">{comment.choice}</ChipLabel>
      <p>{comment.body}</p>
      <footer>
        <button
          aria-controls={replyListId}
          aria-expanded={false}
          id={replyToggleId}
          onClick={openCommentFromControl}
          type="button"
        >
          대댓글 {commentReplies.length}
        </button>
        <span>
          <ReactionButton
            aria-label="댓글 좋아요"
            aria-pressed={false}
            icon="thumbUp"
            onClick={openCommentFromControl}
            tone="like"
            variant="comment"
          >
            {getVisibleReactionCount(likeCount)}
          </ReactionButton>
          <ReactionButton
            aria-label="댓글 싫어요"
            aria-pressed={false}
            icon="thumbDown"
            onClick={openCommentFromControl}
            tone="dislike"
            variant="comment"
          >
            {getVisibleReactionCount(dislikeCount)}
          </ReactionButton>
        </span>
      </footer>
      <div
        aria-hidden="true"
        aria-labelledby={replyToggleId}
        className="wrapper_commentReplies"
        id={replyListId}
        role="region"
      >
        <div className="wrapper_commentRepliesInner">
          <Button
            aria-controls={`${instanceId}-composer`}
            aria-pressed={false}
            className="btn_originalArticle"
            classNameOnly
            onClick={openCommentFromControl}
            type="button"
          >
            대댓글 달기
          </Button>
          {commentReplies.map((reply, replyIndex) => (
            <Fragment key={reply.id}>
              <article
                className="wrapper_commentReplyItem"
                id={`${instanceId}-reply-${reply.id}`}
              >
                <header>
                  <span className="wrapper_commentMeta">
                    <strong>{reply.author}</strong>
                    <NewsCreatedTime>{reply.date}</NewsCreatedTime>
                  </span>
                  <span className="wrapper_commentAction">
                    <IconButton
                      aria-expanded={false}
                      aria-haspopup="menu"
                      baseClassName="btn_commentAction"
                      disabled
                      icon="detail"
                      label="대댓글 더보기"
                    />
                  </span>
                </header>
                <ChipLabel kind="commentChoice">{reply.choice}</ChipLabel>
                <p>{reply.body}</p>
                <footer>
                  <span>
                    <ReactionButton
                      aria-label="대댓글 좋아요"
                      disabled
                      icon="thumbUp"
                      tone="like"
                      variant="comment"
                    >
                      {getVisibleReactionCount(reply.likes)}
                    </ReactionButton>
                    <ReactionButton
                      aria-label="대댓글 싫어요"
                      disabled
                      icon="thumbDown"
                      tone="dislike"
                      variant="comment"
                    >
                      {getVisibleReactionCount(reply.dislikes)}
                    </ReactionButton>
                  </span>
                </footer>
              </article>
              {replyIndex < commentReplies.length - 1 ? (
                <span aria-hidden="true" className="divider_commentItem" />
              ) : null}
            </Fragment>
          ))}
        </div>
      </div>
    </article>
  );
}

function MyCommentDetailPage({
  activeCategory,
  items,
  isLeaving = false,
  onCategoryChange,
  onOpenArticle,
  showTabs,
  tabs,
}: {
  activeCategory: string;
  items: MyCommentSummaryItem[];
  isLeaving?: boolean;
  onCategoryChange: (category: MyCommentKind) => void;
  onOpenArticle: OpenArticleDetail;
  showTabs: boolean;
  tabs: readonly { id: MyCommentKind; label: string }[];
}) {
  const activeCommentKind = myCommentTabs.some(
    (tab) => tab.id === activeCategory,
  )
    ? (activeCategory as MyCommentKind)
    : "all";
  const visibleCommentItems =
    activeCommentKind === "all"
      ? items
      : items.filter((item) => item.commentKind === activeCommentKind);

  return (
    <div
      className={`container_myCommentPage ${getEnterFromRightMotionClassName(isLeaving)}`}
    >
      <h2 className="text_mySectionTitle">댓글</h2>
      {showTabs ? (
        <PillTabMenu
          ariaLabel="내 댓글 카테고리"
          className="tab_myCategoryMenu"
          items={[...tabs]}
          onChange={(nextCategory) =>
            onCategoryChange(nextCategory as MyCommentKind)
          }
          value={activeCommentKind}
        />
      ) : null}
      <div className="wrapper_myCommentList">
        {visibleCommentItems.length === 0 ? (
          <DataUnavailableMessage target="댓글" />
        ) : (
          <SeparatedList
            dividerClassName="divider_mySection"
            getKey={(item, index) => `${item.headline.title}-${index}`}
            items={visibleCommentItems}
            renderItem={(item, index) => (
              <div className="wrapper_myCommentItem">
                <MyCommentCreatedDate>{item.comment.date}</MyCommentCreatedDate>
                <AllNewsHeadlineItem
                  item={item.headline}
                  onClick={() => onOpenArticle(item.article)}
                />
                <MyCommentPreviewThread
                  comment={item.comment}
                  instanceId={`my-comment-detail-${index}`}
                  onOpenComment={() =>
                    onOpenArticle(item.article, { commentId: item.targetCommentId })
                  }
                />
              </div>
            )}
          />
        )}
      </div>
    </div>
  );
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

function MyPageView({
  blockedKeywordSettings,
  isDarkMode,
  isTextLarge,
  onAddBlockedKeyword,
  onDarkModeChange,
  onDeleteBlockedKeyword,
  onToggleBlockedKeyword,
  onOpenBreakingNews,
  onOpenMenu,
  onOpenSearch,
  onQuickMenuBack,
  onToggleTextSize,
  quickMenuRequest,
}: {
  blockedKeywordSettings: BlockedKeywordSetting[];
  isDarkMode: boolean;
  isTextLarge: boolean;
  onAddBlockedKeyword: (keyword: string) => void;
  onDarkModeChange: (isDarkMode: boolean) => void;
  onDeleteBlockedKeyword: (keyword: string) => void;
  onToggleBlockedKeyword: (keyword: string) => void;
  onOpenBreakingNews: () => void;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  onQuickMenuBack: (returnView: Tab) => void;
  onToggleTextSize: () => void;
  quickMenuRequest?: QuickMenuRequest | null;
}) {
  const [activeDetailView, setActiveDetailView] =
    useState<MyPageDetailView>(null);
  const [myArticleDetail, setMyArticleDetail] = useState<{
    article: HomeArticle;
    commentId?: CommentId;
    replyToCommentId?: CommentId;
    scrollTarget?: ArticleDetailOpenOptions["scrollTarget"];
  } | null>(null);
  const [activeVoteCategory, setActiveVoteCategory] = useState(
    () => myVoteCategoryTabs[0] ?? "",
  );
  const [activeBookmarkCategory, setActiveBookmarkCategory] = useState(
    () => mySummaryAllTabLabel,
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
    "내 댓글에 좋아요, 답글": true,
    공지사항: true,
    속보: true,
  });
  const [selectedNewsViewTimes, setSelectedNewsViewTimes] = useState(
    () => new Set(["07:00", "21:00"]),
  );
  const userPreferenceIdRef = useRef<string | null>(null);
  const notificationSettingsIdRef = useRef<string | null>(null);
  const userNewsViewTimeIdRef = useRef<string | null>(null);
  const lastQuickMenuRequestIdRef = useRef<number | null>(null);
  const [isBlockedKeywordDialogOpen, setIsBlockedKeywordDialogOpen] =
    useState(false);
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
  const dynamicCommentCategoryTabs = useMemo(
    () => myCommentTabs,
    [],
  );
  const dynamicBookmarkCategoryTabs = useMemo(
    () => getMySummaryCategoryTabs(myDynamicBookmarkItems),
    [myDynamicBookmarkItems],
  );
  const dynamicVoteCategoryTabs = useMemo(
    () => getMySummaryCategoryTabs(myDynamicVoteItems),
    [myDynamicVoteItems],
  );
  const shouldShowBookmarkCategoryTabs = useMemo(
    () => hasMultipleMySummaryCategories(myDynamicBookmarkItems),
    [myDynamicBookmarkItems],
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
    isDetailOpen: isMyArticleDetailOpen,
    scrollerRef: myPanelContentRef,
  });
  const closeMyArticleDetailImmediately = useCallback(() => {
    myArticleDetailScrollRestore.requestRestore();
    setMyArticleDetail(null);
  }, [myArticleDetailScrollRestore]);
  const closeActiveDetailViewImmediately = useCallback(() => {
    myDetailScrollRestore.requestRestore();
    setMyArticleDetail(null);
    setActiveDetailView(null);
  }, [myDetailScrollRestore]);
  const myArticleDetailExitMotion = useEnterFromRightExitMotion({
    isOpen: isMyArticleDetailOpen,
    onClose: closeMyArticleDetailImmediately,
  });
  const myDetailExitMotion = useEnterFromRightExitMotion({
    isOpen: isMyDetailOpen && !isMyArticleDetailOpen,
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
      ] = await Promise.all([
        commentApi.getCommentsByUserId(mockCurrentUserId),
        commentApi.getComments(),
        commentApi.getCommentReactions(),
        newsApi.getNewsList(),
        bookmarkApi.getBookmarks(mockCurrentUserId),
        pollApi.getPollVotesByUserId(mockCurrentUserId),
        pollApi.getPolls(),
        pollApi.getPollOptions(),
        pollApi.getPollVotes(),
        newsApi.getRecentNewsViews(mockCurrentUserId),
      ]);
      const newsById = new Map(nextNews.map((news) => [news.id, news]));
      const pollById = new Map(nextPolls.map((poll) => [poll.id, poll]));
      const optionById = new Map(
        nextPollOptions.map((option) => [option.id, option]),
      );
      const replyCountByParentId = allComments.reduce<Record<string, number>>(
        (counts, comment) => {
          if (!comment.parentId) {
            return counts;
          }

          counts[comment.parentId] = (counts[comment.parentId] ?? 0) + 1;

          return counts;
        },
        {},
      );
      const commentReactionCountById = allCommentReactions.reduce<
        Record<string, Record<CommentReactionValue, number>>
      >((counts, reaction) => {
        const currentCounts = counts[reaction.commentId] ?? {
          ...emptyCommentReactionCounts,
        };

        counts[reaction.commentId] = {
          ...currentCounts,
          [reaction.type]: currentCounts[reaction.type] + 1,
        };

        return counts;
      }, {});
      const nextItems = nextComments
        .map((comment, index) => {
          const news = newsById.get(comment.newsId);

          if (!news) {
            return null;
          }

          const article = getHomeArticleFromNews(news, index);
          const headline = getAllNewsPreviewFromArticle(article);

          return {
            article,
            category: article.category,
            comment: {
              ...getCommentItemFromApi(
                comment,
                guideOptions,
                {},
                replyCountByParentId[comment.id] ?? 0,
              ),
              dislikes:
                commentReactionCountById[comment.id]?.dislike ??
                emptyCommentReactionCounts.dislike,
              likes:
                commentReactionCountById[comment.id]?.like ??
                emptyCommentReactionCounts.like,
            },
            commentKind: comment.parentId ? "reply" : "comment",
            headline,
            targetCommentId: comment.parentId ?? comment.id,
          };
        })
        .filter((item): item is MyCommentSummaryItem => Boolean(item));
      const nextBookmarkItems = nextBookmarks
        .filter((bookmark) => bookmark.targetType === "news")
        .map((bookmark) => {
          const news = newsById.get(bookmark.targetId);

          return news ? getAllNewsPreviewFromArticle(getHomeArticleFromNews(news, 0)) : null;
        })
        .filter((item): item is MyBookmarkSummaryItem => Boolean(item));
      const nextRecentItems = nextRecentViews
        .map((view, index) => {
          const news = newsById.get(view.newsId);

          if (!news) {
            return null;
          }

          const article = getHomeArticleFromNews(news, index);

          return {
            article,
            dateTime: view.viewedAt,
            image: article.image,
            time: formatNewsDate(view.viewedAt),
            title: article.title,
          };
        })
        .filter((item): item is MyRecentSummaryItem => Boolean(item));
      const nextVoteItems = nextUserVotes
        .map((vote, index) => {
          const poll = pollById.get(vote.pollId);
          const option = optionById.get(vote.pollOptionId);
          const news = poll ? newsById.get(poll.newsId) : undefined;

          if (!poll || !option || !news) {
            return null;
          }

          const article = getHomeArticleFromNews(news, index);
          const headline = getAllNewsPreviewFromArticle(article);
          const votesInPoll = nextPollVotes.filter((item) => item.pollId === poll.id);
          const optionsInPoll = nextPollOptions.filter((item) => item.pollId === poll.id);
          const selectedVotes = votesInPoll.filter(
            (item) => item.pollOptionId === option.id,
          );
          const isBinaryPoll =
            optionsInPoll.length === 2 &&
            binaryGuideOptions.every((label) =>
              optionsInPoll.some((pollOption) => pollOption.label === label),
            );
          const percent =
            votesInPoll.length > 0
              ? Math.round((selectedVotes.length / votesInPoll.length) * 100)
              : 0;

          return {
            article,
            category: article.category,
            headline,
            isBinary: isBinaryPoll,
            percent,
            pollTitle: poll.title,
            selectedOption: option.label,
            title: article.title,
          };
        })
        .filter((item): item is MyVoteSummaryItem => Boolean(item));

      if (!ignore) {
        setMyDynamicCommentItems(nextItems);
        setMyDynamicBookmarkItems(nextBookmarkItems);
        setMyDynamicRecentItems(nextRecentItems);
        setMyDynamicVoteItems(nextVoteItems);
        setMyBookmarkCount(nextBookmarkItems.length);
        setMyVoteCount(nextVoteItems.length);
        setActiveCommentCategory("all");
        setActiveBookmarkCategory(
          getMySummaryCategoryTabs(nextBookmarkItems)[0] ?? mySummaryAllTabLabel,
        );
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
      const [preference, notifications, newsViewTimes] = await Promise.all([
        userApi.getUserPreferences(mockCurrentUserId),
        notificationApi.getNotificationSettings(mockCurrentUserId),
        settingsApi.getUserNewsViewTimes(mockCurrentUserId),
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
      onDarkModeChange(notifications?.darkMode ?? false);
    }

    loadMySettings().catch(() => undefined);

    return () => {
      ignore = true;
    };
  }, [onDarkModeChange]);

  useEffect(() => {
    if (!quickMenuRequest || lastQuickMenuRequestIdRef.current === quickMenuRequest.id) {
      return;
    }

    lastQuickMenuRequestIdRef.current = quickMenuRequest.id;

    if (quickMenuRequest.target === "customNewsSettings") {
      setMyArticleDetail(null);
      setActiveDetailView("customNewsSettings");
      return;
    }

    if (quickMenuRequest.target === "profileSettings") {
      setMyArticleDetail(null);
      setActiveDetailView("profileSettings");
      return;
    }

    setMyArticleDetail(null);
    setActiveDetailView(null);
    window.requestAnimationFrame(() => {
      const target = myPanelContentRef.current?.querySelector<HTMLElement>(
        "[data-my-section='notification-settings']",
      );

      target?.scrollIntoView({ block: "start" });
    });
  }, [quickMenuRequest]);

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
        ageGroupId: Array.from(nextSettings[1] ?? [])[0] ?? "",
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
      commentReplies: nextSettings["내 댓글에 좋아요, 답글"],
      darkMode: nextDarkMode,
      notices: nextSettings["공지사항"],
    };

    if (!settingsId) {
      notificationApi
        .createNotificationSettings({
          userId: mockCurrentUserId,
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
      .createUserNewsViewTimes(mockCurrentUserId, nextTimeList)
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
    setActiveDetailView("profileSettings");
  };

  const openSummaryDetail = (view: MySummaryView) => {
    myDetailScrollRestore.captureScroll();
    setMyArticleDetail(null);
    setActiveDetailView(view);
  };

  const openRecentDetail = () => {
    myDetailScrollRestore.captureScroll();
    setMyArticleDetail(null);
    setActiveDetailView("recent");
  };

  const openMyArticleDetail: OpenArticleDetail = (article, options) => {
    myArticleDetailScrollRestore.captureScroll();
    setMyArticleDetail({
      article,
      commentId: options?.commentId,
      replyToCommentId: options?.replyToCommentId,
      scrollTarget: options?.scrollTarget,
    });
  };

  const detailBackLabel =
    isMyArticleDetailOpen
      ? "기사 본문에서 이전 목록으로 돌아가기"
      : activeDetailView === "profileSettings"
      ? "설정에서 마이페이지로 돌아가기"
      : activeDetailView === "customNewsSettings"
      ? "맞춤형 뉴스 설정에서 마이페이지로 돌아가기"
      : "뉴스 보기 타임 설정에서 마이페이지로 돌아가기";
  const quickMenuReturnView =
    !isMyArticleDetailOpen &&
    quickMenuRequest &&
    (activeDetailView === "customNewsSettings" ||
      activeDetailView === "profileSettings")
    ? quickMenuRequest.returnView
    : null;
  const handleMyDetailBack = isMyArticleDetailOpen
    ? myArticleDetailExitMotion.closeWithMotion
    : quickMenuReturnView
      ? () => onQuickMenuBack(quickMenuReturnView)
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
        isMyArticleDetailOpen ? ".container_newsFeed_detail" : pagePanelContentSelector
      }
      top={
        isMyDetailOpen ? (
          <NewsRollHeaderTop>
            <NewsToolbar
              isTextLarge={isTextLarge}
              onOpenMenu={onOpenMenu}
              onOpenSearch={onOpenSearch}
              onToggleTextSize={onToggleTextSize}
              showSearch={false}
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
              onOpenMenu={onOpenMenu}
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
              onOpenArticle={openMyArticleDetail}
            />
          ) : isBookmarkOpen ? (
            <MyBookmarkDetailPage
              activeCategory={activeBookmarkCategory}
              items={myDynamicBookmarkItems}
              isLeaving={myDetailExitMotion.isLeaving}
              onCategoryChange={setActiveBookmarkCategory}
              onOpenArticle={openMyArticleDetail}
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
          <div
            className={`container_mySettingsPage ${getEnterFromRightMotionClassName(myDetailExitMotion.isLeaving)}`}
          >
            <h2 className="text_myTimeTitle">맞춤형 뉴스 설정</h2>
            {myCategoryGroups.map((group, groupIndex) => (
              <Fragment key={group.title}>
                {groupIndex > 0 ? (
                  <NewsRollDivider className="divider_mySection" />
                ) : null}
                <section className="container_myCategorySection">
                  <h2 className="text_mySectionTitle">{group.title}</h2>
                  <PillTabMenu
                    ariaLabel={group.title}
                    className="tab_myCategoryMenu"
                    getItemState={(optionId) => {
                      const isSelected =
                        selectedCategorySettings[groupIndex]?.has(optionId) ?? false;

                      if (isSelected) {
                        return "active";
                      }

                      return "default";
                    }}
                    items={getMyCategoryTabItems(groupIndex)}
                    keyboardNavigation={groupIndex === 1}
                    onChange={(optionId) => toggleCategorySetting(groupIndex, optionId)}
                    role={groupIndex === 1 ? "radiogroup" : "group"}
                    value={
                      Array.from(selectedCategorySettings[groupIndex] ?? [])[0] ??
                      getMyCategoryOptionId(groupIndex, 0)
                    }
                  />
                </section>
              </Fragment>
            ))}
            <NewsRollDivider className="divider_mySection" />
            <BlockedKeywordSettingsSection
              blockedKeywordSettings={blockedKeywordSettings}
              inputValue={blockedKeywordInputValue}
              isDialogOpen={isBlockedKeywordDialogOpen}
              onCancelDialog={closeBlockedKeywordDialog}
              onInputChange={setBlockedKeywordInputValue}
              onKeywordDelete={onDeleteBlockedKeyword}
              onKeywordToggle={onToggleBlockedKeyword}
              onOpenDialog={() => setIsBlockedKeywordDialogOpen(true)}
              onSaveKeyword={saveBlockedKeyword}
            />
          </div>
          ) : isNewsViewTimeOpen ? (
          <div
            className={`container_myTimePage ${getEnterFromRightMotionClassName(myDetailExitMotion.isLeaving)}`}
          >
            <h2 className="text_myTimeTitle">뉴스 보기 타임</h2>
            {myNewsViewTimeSections.map((section, sectionIndex) => (
              <Fragment key={section.label}>
                {sectionIndex > 0 ? (
                  <NewsRollDivider className="divider_mySection" />
                ) : null}
                <section
                  aria-label={`${section.label} 시간 설정`}
                  className="container_myTimeSection"
                >
                  <h3 className="text_myTimeSectionLabel">{section.label}</h3>
                  <div className="wrapper_myTimeRows">
                    {section.times.map((time) => {
                      const isSelected = selectedNewsViewTimes.has(time);

                      return (
                        <button
                          aria-pressed={isSelected}
                          className="btn_myTimeRow"
                          key={time}
                          onClick={() => toggleNewsViewTime(time)}
                          type="button"
                        >
                          <span className="text_myTimeValue">{time}</span>
                          <NewsRollSwitch checked={isSelected} />
                        </button>
                      );
                    })}
                  </div>
                </section>
              </Fragment>
            ))}
          </div>
        ) : isProfileSettingsOpen ? (
          <div
            className={`container_mySettingsPage ${getEnterFromRightMotionClassName(myDetailExitMotion.isLeaving)}`}
          >
            <h2 className="text_myTimeTitle">설정</h2>
            {myProfileSettingSections.map((section, sectionIndex) => (
              <Fragment key={section.title}>
                {sectionIndex > 0 ? (
                  <NewsRollDivider className="divider_mySection" />
                ) : null}
                <section
                  aria-label={`${section.title} 설정`}
                  className="container_mySettingsDetailSection"
                >
                  <div className="wrapper_mySettingsList">
                    {section.items.map((item) => (
                      <MySettingRow
                        key={item}
                        label={item}
                        showChevron
                      />
                    ))}
                  </div>
                </section>
              </Fragment>
            ))}
          </div>
        ) : (
          <div className="container_myContent">
          <section className="container_myProfile" aria-label="프로필">
            <span className="wrapper_myProfileGreeting">
              <strong>콩콩이님</strong>
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
                <AllNewsMoreButton
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
                  onClick={() => {
                    setNotificationSettings((currentSettings) => {
                      const nextSettings = {
                        ...currentSettings,
                      } as Record<(typeof myNotificationLabels)[number], boolean>;

                      nextSettings[label] = !currentSettings[label];

                      saveNotificationSettings(nextSettings);
                      return nextSettings;
                    });
                  }}
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
          </div>
        )}
      </NewsRollPagePanel>
      )}
    </NewsRollCommonLayout>
  );
}

function DockedAlarmButton({
  isPressed,
  onClick,
}: {
  isPressed: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      aria-label="속보 알림"
      aria-pressed={isPressed}
      className="newsroll_homeDockedAlarm"
      iconOnly
      onClick={onClick}
      radius="full"
      size="large"
      variant="outline"
    >
      <Icon name="alarm" />
    </Button>
  );
}
function getNoticeDateLabel(date: string) {
  if (date.includes("T")) {
    return formatPolicyDate(date);
  }

  const [year, month, day] = date.split(".");

  return `${year}년 ${Number(month)}월 ${Number(day)}일`;
}

function getInfoNoticeItem(notice: Notice): InfoNoticeItem {
  return {
    content: notice.content,
    date: getNoticeDateLabel(notice.registeredAt),
    id: notice.id,
    summary: notice.summary,
    title: notice.title,
    updatedAt: getNoticeDateLabel(notice.updatedAt),
  };
}

function getNoticeDetailItem(notice: InfoNoticeItem): PolicyItem {
  return {
    details: [],
    registeredAt: notice.date,
    summary: notice.content || notice.summary,
    tags: ["공지사항", "안내", "업데이트"],
    title: notice.title,
    updatedAt: notice.updatedAt,
  };
}

function InfoNoticeSection({
  items,
  onNoticeSelect,
}: {
  items: InfoNoticeItem[];
  onNoticeSelect: (notice: InfoNoticeItem, index: number) => void;
}) {
  return (
    <section className="container_infoList" aria-label="공지사항">
      {items.length === 0 ? (
        <DataUnavailableMessage target="공지사항" />
      ) : (
        <SeparatedList
          dividerClassName="divider_infoSection"
          getKey={(notice, index) => `${notice.title}-${notice.date}-${index}`}
          items={items}
          renderItem={(notice, index) => (
            <button
              className="btn_infoNoticeItem"
              onClick={() => onNoticeSelect(notice, index)}
              type="button"
            >
              <div className="wrapper_infoNoticeContent">
                <span className="text_infoItemTitle">{notice.title}</span>
                <p className="text_infoBody text_lineClamp2">
                  {notice.summary}
                </p>
                <span className="text_infoMeta">{notice.date}</span>
              </div>
            </button>
          )}
        />
      )}
    </section>
  );
}

function InfoFaqSection({ items }: { items: Faq[] }) {
  const [openFaqIndexes, setOpenFaqIndexes] = useState<Set<number>>(
    () => new Set(),
  );

  return (
    <section className="container_infoList" aria-label="FAQ">
      {items.length === 0 ? (
        <DataUnavailableMessage target="FAQ" />
      ) : (
        <SeparatedList
          dividerClassName="divider_infoSection"
          getKey={(item, index) => `${item.question}-${index}`}
          items={items}
          renderItem={(item, index) => (
            <details
              className="container_infoFaqItem"
              onToggle={(event) => {
                const isOpen = event.currentTarget.open;

                setOpenFaqIndexes((current) => {
                  const next = new Set(current);

                  if (isOpen) {
                    next.add(index);
                  } else {
                    next.delete(index);
                  }

                  return next;
                });
              }}
              open={openFaqIndexes.has(index)}
            >
              <summary className="btn_infoFaqSummary">
                <span className="text_infoItemTitle">Q. {item.question}</span>
                <span className="icon_infoChevron" aria-hidden="true" />
              </summary>
              <p className="text_infoBody text_infoFaqBody">{item.answer}</p>
            </details>
          )}
        />
      )}
    </section>
  );
}

function InfoInquirySection({ items }: { items: InquiryType[] }) {
  const [selectedInquiryType, setSelectedInquiryType] = useState(
    items[0]?.label ?? "",
  );
  const [inquiryTitle, setInquiryTitle] = useState("");
  const [inquiryContent, setInquiryContent] = useState("");
  const [inquiryStatus, setInquiryStatus] = useState<"error" | "sent" | "sending" | null>(
    null,
  );
  const [isInquiryTypeOpen, setIsInquiryTypeOpen] = useState(false);
  const inquiryTypeMenuId = "info-inquiry-type-menu";

  useEffect(() => {
    if (items.length > 0 && !items.some((item) => item.label === selectedInquiryType)) {
      setSelectedInquiryType(items[0].label);
    }
  }, [items, selectedInquiryType]);

  if (items.length === 0) {
    return (
      <section className="container_infoList" aria-label="1:1 문의">
        <DataUnavailableMessage target="문의 유형" />
      </section>
    );
  }

  return (
    <form
      className="wrapper_infoInquiry"
      aria-label="1:1 문의"
      onSubmit={(event) => {
        event.preventDefault();

        const selectedType = items.find((item) => item.label === selectedInquiryType);

        if (!selectedType || !inquiryTitle.trim() || !inquiryContent.trim()) {
          setInquiryStatus("error");
          return;
        }

        setInquiryStatus("sending");
        inquiryApi
          .createInquiry({
            content: inquiryContent.trim(),
            title: inquiryTitle.trim(),
            typeId: selectedType.id,
            userId: mockCurrentUserId,
          })
          .then(() => {
            setInquiryTitle("");
            setInquiryContent("");
            setInquiryStatus("sent");
          })
          .catch(() => {
            setInquiryStatus("error");
          });
      }}
    >
      <label className="wrapper_infoField">
        <span className="text_infoFieldLabel">문의 유형</span>
        <div className="wrapper_infoSelectControl">
          <button
            aria-controls={isInquiryTypeOpen ? inquiryTypeMenuId : undefined}
            aria-expanded={isInquiryTypeOpen}
            aria-haspopup="listbox"
            aria-label="문의 유형"
            className="btn_commentDropdown select_infoField"
            onClick={() => setIsInquiryTypeOpen((current) => !current)}
            type="button"
          >
            {selectedInquiryType}
            <NewsRollDropdownArrow />
          </button>
          {isInquiryTypeOpen ? (
            <div
              className="listbox_commentDropdown listbox_infoInquiryType"
              id={inquiryTypeMenuId}
              role="listbox"
            >
              {items.map((type) => (
                <button
                  aria-selected={selectedInquiryType === type.label}
                  key={type.id}
                  onClick={() => {
                    setSelectedInquiryType(type.label);
                    setIsInquiryTypeOpen(false);
                  }}
                  role="option"
                  type="button"
                >
                  {type.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </label>
      <div className="wrapper_infoField">
        <span className="text_infoFieldLabel">제목</span>
        <TextInput
          aria-label="문의 제목"
          onChange={(event) => setInquiryTitle(event.target.value)}
          placeholder="문의 제목을 입력해주세요."
          inputSize="large"
          radius="rounded"
          type="text"
          value={inquiryTitle}
          variant="outline"
          wrapperClassName="input_commentComposer"
        />
      </div>
      <div className="wrapper_infoField">
        <span className="text_infoFieldLabel">내용</span>
        <Textarea
          aria-label="문의 내용"
          className="textarea_infoComposer"
          onChange={(event) => setInquiryContent(event.target.value)}
          placeholder="문의 내용을 자세히 작성해주세요."
          radius="rounded"
          rows={7}
          textareaSize="large"
          value={inquiryContent}
        />
      </div>
      {inquiryStatus === "sent" ? (
        <p className="text_infoSubmitStatus" role="status">
          문의가 접수되었습니다.
        </p>
      ) : null}
      {inquiryStatus === "error" ? (
        <p className="text_infoSubmitStatus is_error" role="alert">
          문의 내용을 확인해주세요.
        </p>
      ) : null}
      <Button
        className="btn_infoSubmit"
        disabled={inquiryStatus === "sending"}
        radius="rounded"
        size="large"
        type="submit"
      >
        <Icon name="submit" />
        {inquiryStatus === "sending" ? "보내는 중" : "문의하기"}
      </Button>
    </form>
  );
}

function InfoView({
  isTextLarge,
  onOpenBreakingNews,
  onOpenMenu,
  onOpenSearch,
  onToggleTextSize,
}: {
  isTextLarge: boolean;
  onOpenBreakingNews: () => void;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  onToggleTextSize: () => void;
}) {
  const [activeInfoTab, setActiveInfoTab] = useState<InfoTab>("notice");
  const [noticeDetailItem, setNoticeDetailItem] = useState<PolicyItem | null>(
    null,
  );
  const [noticeDetailIndex, setNoticeDetailIndex] = useState<number | null>(
    null,
  );
  const [infoNotices, setInfoNotices] = useState<InfoNoticeItem[]>([]);
  const [infoFaqs, setInfoFaqs] = useState<Faq[]>([]);
  const [infoInquiryTypes, setInfoInquiryTypes] = useState<InquiryType[]>([]);
  const infoPanelContentRef = useRef<HTMLDivElement>(null);
  const isNoticeDetailOpen = noticeDetailItem !== null;
  const previousNotice =
    noticeDetailIndex !== null && noticeDetailIndex > 0
      ? infoNotices[noticeDetailIndex - 1]
      : null;
  const nextNotice =
    noticeDetailIndex !== null && noticeDetailIndex < infoNotices.length - 1
      ? infoNotices[noticeDetailIndex + 1]
      : null;
  const infoDetailScrollRestore = useDetailScrollRestore({
    isDetailOpen: isNoticeDetailOpen,
    scrollerRef: infoPanelContentRef,
  });
  const closeNoticeDetailImmediately = useCallback(() => {
    infoDetailScrollRestore.requestRestore();
    setNoticeDetailItem(null);
    setNoticeDetailIndex(null);
  }, [infoDetailScrollRestore]);
  const noticeDetailExitMotion = useEnterFromRightExitMotion({
    isOpen: isNoticeDetailOpen,
    onClose: closeNoticeDetailImmediately,
  });
  const activeInfoTabLabel =
    infoTabs.find((tab) => tab.id === activeInfoTab)?.label ?? "공지사항";

  useEffect(() => {
    let ignore = false;

    async function loadInfoData() {
      const [nextNotices, nextFaqs, nextInquiryTypes] = await Promise.all([
        infoApi.getNotices(),
        infoApi.getFaqs(),
        infoApi.getInquiryTypes(),
      ]);

      if (!ignore) {
        setInfoNotices(nextNotices.map(getInfoNoticeItem));
        setInfoFaqs(nextFaqs);
        setInfoInquiryTypes(nextInquiryTypes);
      }
    }

    loadInfoData().catch(() => {
      if (!ignore) {
        setInfoNotices([]);
        setInfoFaqs([]);
        setInfoInquiryTypes([]);
      }
    });

    return () => {
      ignore = true;
    };
  }, []);

  function handleInfoTabChange(nextTab: InfoTab) {
    setActiveInfoTab(nextTab);
    setNoticeDetailItem(null);
    setNoticeDetailIndex(null);
  }

  function openNoticeDetail(
    notice: InfoNoticeItem,
    index: number,
  ) {
    infoDetailScrollRestore.captureScroll();
    setNoticeDetailItem(getNoticeDetailItem(notice));
    setNoticeDetailIndex(index);
  }

  function moveNoticeDetail(notice: InfoNoticeItem, index: number) {
    setNoticeDetailItem(getNoticeDetailItem(notice));
    setNoticeDetailIndex(index);
  }

  const closeNoticeDetail = noticeDetailExitMotion.closeWithMotion;

  return (
    <NewsRollCommonLayout
      aria-label="인포메이션"
      className="newsroll_sheetFrame newsroll_info_screen"
      dockedGap={pagePanelDockedGap}
      initialGap={pagePanelInitialGap}
      {...fixedDockedPanelProps}
      minInitialTop={pagePanelInitialTop}
      sheetClassName="newsroll_sheetFrameSheet container_homeSheet newsroll_info_sheet"
      sheetScrollSelector={pagePanelContentSelector}
      top={
        <NewsRollHeaderTop>
          <NewsToolbar
            isTextLarge={isTextLarge}
            onOpenMenu={onOpenMenu}
            onOpenSearch={onOpenSearch}
            onToggleTextSize={onToggleTextSize}
          />
          <NewsRollDockedControls
            className="newsroll_motion_dockedPop newsroll_allDockedControls newsroll_panelHeaderRow"
            isDetailOpen={isNoticeDetailOpen}
          >
            {isNoticeDetailOpen ? (
              <NewsRollDetailBackButton
                ariaLabel="공지사항 목록으로 돌아가기"
                onClick={closeNoticeDetail}
              />
            ) : null}
            {isNoticeDetailOpen ? null : (
              <h1 className="text_panelHeaderTitle">{activeInfoTabLabel}</h1>
            )}
            <DockedAlarmButton
              isPressed={false}
              onClick={onOpenBreakingNews}
            />
          </NewsRollDockedControls>
        </NewsRollHeaderTop>
      }
    >
      <NewsRollPagePanel
        ariaLabel="인포메이션 콘텐츠 영역"
        contentRef={infoPanelContentRef}
      >
        {noticeDetailItem ? (
          <PolicyDetailContent
            hideDetailList
            hideDetailToggle
            isLeaving={noticeDetailExitMotion.isLeaving}
            item={noticeDetailItem}
            key={`notice-detail-${noticeDetailIndex ?? "unknown"}`}
            onNextItem={
              nextNotice && noticeDetailIndex !== null
                ? () => moveNoticeDetail(nextNotice, noticeDetailIndex + 1)
                : undefined
            }
            onPreviousItem={
              previousNotice && noticeDetailIndex !== null
                ? () => moveNoticeDetail(previousNotice, noticeDetailIndex - 1)
                : undefined
            }
          />
        ) : (
          <div className="container_infoContent">
            <PillTabMenu
              ariaLabel="인포메이션 메뉴"
              className="tab_myCategoryMenu"
              getPanelId={(id) =>
                id === activeInfoTab ? `newsroll_info_panel_${id}` : undefined
              }
              getTabId={(id) => `newsroll_info_tab_${id}`}
              items={infoTabs}
              onChange={handleInfoTabChange}
              value={activeInfoTab}
            />
            <div
              aria-labelledby={`newsroll_info_tab_${activeInfoTab}`}
              className="container_infoPanel"
              id={`newsroll_info_panel_${activeInfoTab}`}
              role="tabpanel"
            >
              {activeInfoTab === "notice" ? (
                <InfoNoticeSection
                  items={infoNotices}
                  onNoticeSelect={openNoticeDetail}
                />
              ) : null}
              {activeInfoTab === "faq" ? <InfoFaqSection items={infoFaqs} /> : null}
              {activeInfoTab === "inquiry" ? (
                <InfoInquirySection items={infoInquiryTypes} />
              ) : null}
            </div>
          </div>
        )}
      </NewsRollPagePanel>
    </NewsRollCommonLayout>
  );
}

function LoginView({ onNext }: { onNext: () => void }) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <section className="container_loginScreen" aria-label="로그인">
      <button
        aria-label="다음 임시 화면 보기"
        className="btn_loginNext"
        onClick={onNext}
        type="button"
      >
        <span aria-hidden="true">-&gt;</span>
      </button>

      <div className="wrapper_loginContent">
        <div className="wrapper_loginHeader">
          <p className="text_loginEyebrow">NewsRoll</p>
          <h1 className="text_loginTitle">로그인</h1>
        </div>

        <form
          className="form_login"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="wrapper_loginInputs">
            <TransparentTextInput
              aria-label="이메일 입력"
              autoComplete="email"
              placeholder="이메일"
              type="email"
            />
            <div className="wrapper_loginPasswordField">
              <TransparentTextInput
                aria-label="비밀번호 입력"
                autoComplete="current-password"
                placeholder="비밀번호"
                type={isPasswordVisible ? "text" : "password"}
                wrapperClassName="input_loginPassword"
              />
              <button
                aria-label={isPasswordVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
                aria-pressed={isPasswordVisible}
                className="btn_loginPasswordToggle"
                onClick={() => setIsPasswordVisible((current) => !current)}
                type="button"
              >
                <Icon name="eye" />
              </button>
            </div>
            <Button
              className="btn_loginSubmit"
              radius="rounded"
              size="large"
              type="submit"
              variant="filled"
            >
              로그인
            </Button>
            <button className="btn_loginSignup" type="button">
              회원가입
            </button>
          </div>

          <div className="wrapper_socialLogin" aria-label="소셜 로그인">
            {["kakao", "naver", "google"].map((provider) => (
              <span
                aria-label={`${provider} 로그인 아이콘 영역`}
                className="box_socialLoginIcon"
                key={provider}
                role="img"
              />
            ))}
          </div>
        </form>
      </div>
    </section>
  );
}

function ActiveView({
  allNewsEntryMotionClassName = "",
  blockedKeywords,
  blockedKeywordSettings,
  isDarkMode,
  isTextLarge,
  isAllNewsBreakingEntry = false,
  onAddBlockedKeyword,
  onDarkModeChange,
  onDeleteBlockedKeyword,
  onToggleBlockedKeyword,
  onCloseSearch,
  onLoginNext,
  onOpenAllNews,
  onOpenMenu,
  onOpenSearch,
  onQuickMenuBack,
  onToggleTextSize,
  quickMenuRequest,
  view,
}: {
  allNewsEntryMotionClassName?: string;
  blockedKeywords: string[];
  blockedKeywordSettings: BlockedKeywordSetting[];
  isDarkMode: boolean;
  isTextLarge: boolean;
  isAllNewsBreakingEntry?: boolean;
  onAddBlockedKeyword: (keyword: string) => void;
  onDarkModeChange: (isDarkMode: boolean) => void;
  onDeleteBlockedKeyword: (keyword: string) => void;
  onToggleBlockedKeyword: (keyword: string) => void;
  onCloseSearch: () => void;
  onLoginNext: () => void;
  onOpenAllNews: () => void;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  onQuickMenuBack: (returnView: Tab) => void;
  onToggleTextSize: () => void;
  quickMenuRequest?: QuickMenuRequest | null;
  view: View;
}) {
  if (view === "login") {
    return <LoginView onNext={onLoginNext} />;
  }

  if (view === "search") {
    return <SearchView blockedKeywords={blockedKeywords} onClose={onCloseSearch} />;
  }

  if (view === "all") {
    return (
      <AllNewsView
        blockedKeywords={blockedKeywords}
        entryMotionClassName={allNewsEntryMotionClassName}
        initialShowAllBreaking={isAllNewsBreakingEntry}
        isTextLarge={isTextLarge}
        onOpenMenu={onOpenMenu}
        onOpenSearch={onOpenSearch}
        onToggleTextSize={onToggleTextSize}
      />
    );
  }

  if (view === "policy") {
    return (
      <PolicyView
        isTextLarge={isTextLarge}
        onOpenBreakingNews={onOpenAllNews}
        onOpenMenu={onOpenMenu}
        onOpenSearch={onOpenSearch}
        onToggleTextSize={onToggleTextSize}
      />
    );
  }

  if (view === "my") {
    return (
      <MyPageView
        blockedKeywordSettings={blockedKeywordSettings}
        isDarkMode={isDarkMode}
        isTextLarge={isTextLarge}
        onAddBlockedKeyword={onAddBlockedKeyword}
        onDarkModeChange={onDarkModeChange}
        onDeleteBlockedKeyword={onDeleteBlockedKeyword}
        onToggleBlockedKeyword={onToggleBlockedKeyword}
        onOpenBreakingNews={onOpenAllNews}
        onOpenMenu={onOpenMenu}
        onOpenSearch={onOpenSearch}
        onQuickMenuBack={onQuickMenuBack}
        onToggleTextSize={onToggleTextSize}
        quickMenuRequest={quickMenuRequest}
      />
    );
  }

  if (view === "info") {
    return (
      <InfoView
        isTextLarge={isTextLarge}
        onOpenBreakingNews={onOpenAllNews}
        onOpenMenu={onOpenMenu}
        onOpenSearch={onOpenSearch}
        onToggleTextSize={onToggleTextSize}
      />
    );
  }

  return (
    <HomeView
      blockedKeywords={blockedKeywords}
      isTextLarge={isTextLarge}
      onOpenBreakingNews={onOpenAllNews}
      onOpenMenu={onOpenMenu}
      onOpenSearch={onOpenSearch}
      onToggleTextSize={onToggleTextSize}
    />
  );
}

export function NewsHomeScreen() {
  const [activeView, setActiveView] = useState<View>("login");
  const [searchBackView, setSearchBackView] = useState<Tab>("home");
  const viewNavigationTimerRef = useRef<number | null>(null);
  const allNewsEntryMotionTimerRef = useRef<number | null>(null);
  const [viewResetKeys, setViewResetKeys] = useState<Record<Tab, number>>({
    all: 0,
    home: 0,
    info: 0,
    my: 0,
    policy: 0,
  });
  const [allNewsEntryMotionClassName, setAllNewsEntryMotionClassName] =
    useState("");
  const [isAllNewsBreakingEntry, setIsAllNewsBreakingEntry] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [quickMenuRequest, setQuickMenuRequest] =
    useState<QuickMenuRequest | null>(null);
  const [isTextLarge, setIsTextLarge] = useState(false);
  const [blockedKeywordSettings, setBlockedKeywordSettings] = useState<
    BlockedKeywordSetting[]
  >([]);
  const blockedKeywords = useMemo(
    () =>
      blockedKeywordSettings
        .filter((setting) => setting.isActive)
        .map((setting) => setting.keyword),
    [blockedKeywordSettings],
  );
  const isPanelView =
    activeView === "policy" || activeView === "my" || activeView === "info";
  const activeViewResetKey =
    activeView === "search" || activeView === "login" ? 0 : viewResetKeys[activeView];

  useLayoutEffect(() => {
    resetNewsRollViewport();
  }, [activeView, activeViewResetKey]);

  useEffect(() => {
    let ignore = false;

    async function loadRootSettings() {
      const [keywords, notifications] = await Promise.all([
        settingsApi.getBlockedKeywords(mockCurrentUserId),
        notificationApi.getNotificationSettings(mockCurrentUserId),
      ]);

      if (ignore) {
        return;
      }

      setBlockedKeywordSettings(getBlockedKeywordSettingsFromApi(keywords));
      setIsDarkMode(notifications?.darkMode ?? false);
    }

    loadRootSettings().catch(() => undefined);

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (viewNavigationTimerRef.current !== null) {
        window.clearTimeout(viewNavigationTimerRef.current);
      }

      if (allNewsEntryMotionTimerRef.current !== null) {
        window.clearTimeout(allNewsEntryMotionTimerRef.current);
      }
    };
  }, []);

  function openSearch() {
    if (activeView !== "search") {
      setSearchBackView(activeView === "login" ? "home" : activeView);
    }

    setActiveView("search");
  }

  function openDefaultTab(tab: Tab) {
    const moveToTab = () => {
      setAllNewsEntryMotionClassName("");
      setIsAllNewsBreakingEntry(false);
      setActiveView(tab);
      setSearchBackView(tab);
      setViewResetKeys((current) => ({
        ...current,
        [tab]: current[tab] + 1,
      }));
    };

    if (hasActiveEnterFromRightMotion()) {
      requestEnterFromRightExitMotion();

      if (viewNavigationTimerRef.current !== null) {
        window.clearTimeout(viewNavigationTimerRef.current);
      }

      viewNavigationTimerRef.current = window.setTimeout(() => {
        viewNavigationTimerRef.current = null;
        moveToTab();
      }, nextArticleRevealDelayMs);

      return;
    }

    moveToTab();
  }

  function openBreakingNewsView() {
    const moveToBreakingNews = () => {
      setAllNewsEntryMotionClassName(getEnterFromRightMotionClassName());
      setIsAllNewsBreakingEntry(true);
      setActiveView("all");
      setSearchBackView("all");
      setViewResetKeys((current) => ({
        ...current,
        all: current.all + 1,
      }));

      if (allNewsEntryMotionTimerRef.current !== null) {
        window.clearTimeout(allNewsEntryMotionTimerRef.current);
      }

      allNewsEntryMotionTimerRef.current = window.setTimeout(() => {
        allNewsEntryMotionTimerRef.current = null;
        setAllNewsEntryMotionClassName("");
      }, nextArticleRevealDelayMs);
    };

    if (hasActiveEnterFromRightMotion()) {
      requestEnterFromRightExitMotion();

      if (viewNavigationTimerRef.current !== null) {
        window.clearTimeout(viewNavigationTimerRef.current);
      }

      viewNavigationTimerRef.current = window.setTimeout(() => {
        viewNavigationTimerRef.current = null;
        moveToBreakingNews();
      }, nextArticleRevealDelayMs);

      return;
    }

    moveToBreakingNews();
  }

  function openQuickMenuTarget(target: QuickMenuTarget) {
    const returnView: Tab =
      activeView === "search"
        ? searchBackView
        : activeView === "login"
          ? "home"
          : activeView;

    setIsQuickMenuOpen(false);
    setAllNewsEntryMotionClassName("");
    setIsAllNewsBreakingEntry(false);
    setActiveView("my");
    setSearchBackView(returnView);
    setQuickMenuRequest({ id: Date.now(), returnView, target });
    setViewResetKeys((current) => ({
      ...current,
      my: current.my + 1,
    }));
  }

  function returnFromQuickMenuTarget(returnView: Tab) {
    setQuickMenuRequest(null);
    setAllNewsEntryMotionClassName("");
    setIsAllNewsBreakingEntry(false);
    setActiveView(returnView);
    setSearchBackView(returnView);
    setViewResetKeys((current) => ({
      ...current,
      [returnView]: current[returnView] + 1,
    }));
  }

  function addBlockedKeyword(keyword: string) {
    const normalizedKeyword = normalizeBlockedKeyword(keyword);

    if (!normalizedKeyword) {
      return;
    }

    if (
      blockedKeywordSettings.some(
        (item) => normalizeBlockedKeyword(item.keyword) === normalizedKeyword,
      )
    ) {
      return;
    }

    setBlockedKeywordSettings((current) => {
      const hasSameKeyword = current.some(
        (item) => normalizeBlockedKeyword(item.keyword) === normalizedKeyword,
      );

      return hasSameKeyword
        ? current
        : [...current, { isActive: true, keyword: keyword.trim() }];
    });

    settingsApi
      .createBlockedKeyword({
        isActive: true,
        keyword: keyword.trim(),
        userId: mockCurrentUserId,
      })
      .then((createdKeyword) => {
        setBlockedKeywordSettings((current) =>
          current.map((item) =>
            !item.id && normalizeBlockedKeyword(item.keyword) === normalizedKeyword
              ? {
                  id: createdKeyword.id,
                  isActive: createdKeyword.isActive,
                  keyword: createdKeyword.keyword,
                }
              : item,
          ),
        );
      })
      .catch(() => undefined);
  }

  function toggleBlockedKeyword(keyword: string) {
    const targetKeyword = blockedKeywordSettings.find(
      (setting) => setting.keyword === keyword,
    );
    const nextIsActive = !targetKeyword?.isActive;

    setBlockedKeywordSettings((current) =>
      current.map((setting) =>
        setting.keyword === keyword
          ? { ...setting, isActive: !setting.isActive }
          : setting,
      ),
    );

    if (targetKeyword?.id) {
      settingsApi
        .updateBlockedKeyword(targetKeyword.id, { isActive: nextIsActive })
        .catch(() => undefined);
    }
  }

  function deleteBlockedKeyword(keyword: string) {
    const targetKeyword = blockedKeywordSettings.find(
      (setting) => setting.keyword === keyword,
    );

    setBlockedKeywordSettings((current) =>
      current.filter((setting) => setting.keyword !== keyword),
    );

    if (targetKeyword?.id) {
      settingsApi.deleteBlockedKeyword(targetKeyword.id).catch(() => undefined);
    }
  }

  return (
    <main
      className={`newsroll_screen${activeView === "home" ? " newsroll_screen_home" : ""}${
        activeView === "all" ? " newsroll_screen_all" : ""
      }${activeView === "login" ? " newsroll_screen_login" : ""}${
        activeView === "search" ? " newsroll_screen_search" : ""
      }${isPanelView ? " newsroll_screen_panel" : ""}${
        isTextLarge ? " newsroll_text_large" : ""
      }${isDarkMode ? " newsroll_dark" : ""}`}
    >
      <div className="newsroll_phone" aria-label="NewsRoll">
        <ActiveView
          allNewsEntryMotionClassName={allNewsEntryMotionClassName}
          blockedKeywords={blockedKeywords}
          blockedKeywordSettings={blockedKeywordSettings}
          isDarkMode={isDarkMode}
          key={`${activeView}-${activeViewResetKey}`}
          isAllNewsBreakingEntry={isAllNewsBreakingEntry}
          isTextLarge={isTextLarge}
          onAddBlockedKeyword={addBlockedKeyword}
          onDarkModeChange={setIsDarkMode}
          onDeleteBlockedKeyword={deleteBlockedKeyword}
          onToggleBlockedKeyword={toggleBlockedKeyword}
          onCloseSearch={() => setActiveView(searchBackView)}
          onLoginNext={() => setActiveView("home")}
          onOpenAllNews={openBreakingNewsView}
          onOpenMenu={() => setIsQuickMenuOpen(true)}
          onOpenSearch={openSearch}
          onQuickMenuBack={returnFromQuickMenuTarget}
          onToggleTextSize={() => setIsTextLarge((current) => !current)}
          quickMenuRequest={quickMenuRequest}
          view={activeView}
        />
      </div>
      <QuickMenuDrawer
        isOpen={isQuickMenuOpen}
        isDarkMode={isDarkMode}
        onClose={() => setIsQuickMenuOpen(false)}
        onNavigate={openQuickMenuTarget}
      />

      {activeView !== "search" && activeView !== "login" ? (
        <nav className="newsroll_bottom_nav" aria-label="하단 탐색">
          {navItems.map((item) => (
            <IconButton
              aria-current={activeView === item.tab ? "page" : undefined}
              baseClassName="newsroll_nav_item"
              icon={item.icon}
              key={item.label}
              label={item.label}
              onClick={() => openDefaultTab(item.tab)}
            />
          ))}
        </nav>
      ) : null}
    </main>
  );
}
