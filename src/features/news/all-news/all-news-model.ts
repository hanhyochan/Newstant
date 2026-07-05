import type { GuideKind, HomeArticle } from "@/features/news/model";

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
