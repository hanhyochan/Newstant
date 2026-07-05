import type { NewsListItem } from "@/shared/newsroll/api";
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

export const articleImage = "/images/news-apartment.png";
export const defaultNewsDateTime = "2026-12-31T08:30:00";
export const defaultNewsDateLabel = "2026년 12월 31일 08:30";

export function formatNewsDate(value: string) {
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
  "어쩌구 저쩌구해서 어케 해야한다.",
  "상황을 더 지켜본 뒤 판단해야 한다.",
  "정책 지원을 먼저 확대해야 한다.",
];

export const binaryGuideOptions = ["그렇다", "아니다"];

