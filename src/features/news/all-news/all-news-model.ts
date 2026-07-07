import { homeArticle, type GuideKind, type HomeArticle } from "@/features/news/model";

export type AllNewsArticlePreview = {
  article?: HomeArticle;
  category?: string;
  guideKind?: GuideKind;
  image: string;
  title: string;
};

export function getAllNewsPreviewFromArticle(article: HomeArticle): AllNewsArticlePreview {
  return {
    article,
    category: article.category,
    image: article.image,
    title: article.title,
  };
}

export function groupAllNewsByValue(
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

export const allNewsPresses = ["중앙일보", "국민일보", "한겨레"];

export const allNewsDockedScrollSelectors = {
  contentScroller: ".all_panelContent",
  immediatePanel: ".all_latest_panel",
  latestScroller: ".all_latest_scroller",
  panel: ".all_panel",
};

export const allNewsSwipeAxisThresholdPx = 8;

export type SwipeAxis = "horizontal" | "vertical";

export const allNewsRelayCategories = ["정치", "경제", "사회", "문화", "국제"];

export function createAllNewsArticle(
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
