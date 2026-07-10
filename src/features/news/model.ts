import type { NewsListItem } from "@/shared/newstant/api";
import type { CommentId } from "@/features/comments/utils/comment-data";

export type HomeViewMode = "reels" | "block";

export type GuideKind = "stacked" | "binary";

export type ArticleDetailOpenOptions = {
  commentId?: CommentId;
  replyToCommentId?: CommentId;
  scrollTarget?: "bodySearch" | "poll";
};

export type OpenArticleDetail = (
  article: HomeArticle,
  options?: ArticleDetailOpenOptions,
) => void;

export type HomeArticle = {
  body?: string;
  category: string;
  categoryId?: string;
  date: string;
  dateTime?: string;
  image: string;
  imageAlt: string;
  guideKind?: GuideKind;
  id?: string;
  ageGroupIds?: string[];
  pressId?: string;
  pressName?: string;
  reporterName?: string;
  title: string;
};

export type BreakingNewsItem = {
  article: HomeArticle;
  id: string;
  title: string;
  updatedAt: string;
};

export type BlockedKeywordSetting = {
  id?: string;
  isActive: boolean;
  keyword: string;
};

export type PolicyDetailItem = {
  label: string;
  value: string;
};

export type PolicyItem = {
  ageGroupIds?: string[];
  details: PolicyDetailItem[];
  id: string;
  registeredAt: string;
  summary: string;
  tags: string[];
  title: string;
  updatedAt: string;
};

export const articleImage = "/images/Gemini_Generated_Image_7j3t0x7j3t0x7j3t.webp";
export const defaultNewsDateTime = "2026-12-31T08:30:00";
export const defaultNewsDateLabel = "0000년 00월 00일";

export function formatNewsDate(_value: string) {
  return defaultNewsDateLabel;
}

export function formatHeroCount(count: number) {
  return new Intl.NumberFormat("ko-KR").format(count);
}

function getHomeArticleGuideKind(index: number): GuideKind {
  return index % 2 === 0 ? "stacked" : "binary";
}

export function getHomeArticleFromNews(item: NewsListItem, index: number): HomeArticle {
  return {
    ageGroupIds: item.ageGroupIds,
    body: item.body,
    category: item.category?.label ?? item.categoryId,
    categoryId: item.categoryId,
    date: formatNewsDate(item.publishedAt),
    dateTime: item.publishedAt,
    guideKind: getHomeArticleGuideKind(index),
    id: item.id,
    image: item.imageUrl,
    imageAlt: item.title,
    pressId: item.pressId,
    pressName: item.press?.name,
    reporterName: item.reporterName,
    title: item.title,
  };
}

function getBreakingTimestamp(article: HomeArticle) {
  const timestamp = Date.parse(article.dateTime ?? "");

  return Number.isFinite(timestamp) ? timestamp : 0;
}

function getBreakingDateId(updatedAt: string) {
  return updatedAt.replace(/\D/g, "").slice(0, 14) || "unknown";
}

export function getBreakingNewsItems(articles: HomeArticle[]) {
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

export function getLatestBreakingNewsItem(articles: HomeArticle[]) {
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

export function filterArticlesByBlockedKeywords(
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

export const guideOptions = [
  "긍정적인 영향이 더 클 것으로 본다.",
  "효과를 판단하려면 더 지켜봐야 한다.",
  "부작용을 줄일 보완책이 먼저 필요하다.",
];

export const binaryGuideOptions = ["그렇다", "아니다"];

export const homeArticle: HomeArticle = {
  category: "정치",
  date: defaultNewsDateLabel,
  image: articleImage,
  imageAlt: "아파트 단지 전경",
  title: "용인 수지, 강남·분당 가격 동조화로 15억 시대 진입",
};

export const homeArticles: HomeArticle[] = [
  {
    ...homeArticle,
    guideKind: "stacked",
  },
  {
    category: "경제",
    date: defaultNewsDateLabel,
    guideKind: "binary",
    image: "/images/Gemini_Generated_Image_2vvqys2vvqys2vvq.webp",
    imageAlt: "도심 아파트 단지 전경",
    title: "대출 규제 이후 서울 외곽 거래량 다시 줄었다",
  },
  {
    category: "사회",
    date: defaultNewsDateLabel,
    guideKind: "stacked",
    image: "/images/Gemini_Generated_Image_96baaj96baaj96ba.webp",
    imageAlt: "아침 햇살이 비치는 주거 단지",
    title: "청년 월세 지원 확대 논의, 지자체별 신청 조건 달라",
  },
  {
    category: "정책",
    date: defaultNewsDateLabel,
    guideKind: "binary",
    image: "/images/Gemini_Generated_Image_f51g65f51g65f51g.webp",
    imageAlt: "신축 공동주택 단지",
    title: "주택시장 안정 대책 발표 앞두고 실수요자 관망세",
  },
  {
    category: "지역",
    date: defaultNewsDateLabel,
    guideKind: "stacked",
    image: "/images/Gemini_Generated_Image_le942ile942ile94.webp",
    imageAlt: "수도권 아파트 단지",
    title: "수도권 남부 교통 호재 지역, 매수 문의만 소폭 증가",
  },
  {
    category: "복지",
    date: defaultNewsDateLabel,
    guideKind: "binary",
    image: "/images/Gemini_Generated_Image_nil3rwnil3rwnil3.webp",
    imageAlt: "주거지와 상가가 함께 보이는 단지",
    title: "신혼부부 주거비 지원 기준 완화 여부 다음 달 결정",
  },
  {
    category: "문화",
    date: defaultNewsDateLabel,
    guideKind: "stacked",
    image: "/images/Gemini_Generated_Image_qy1qu1qy1qu1qy1q.webp",
    imageAlt: "도심 주거 단지와 하늘",
    title: "동네 생활권 문화시설 확충, 주민 체감도 조사 시작",
  },
];
