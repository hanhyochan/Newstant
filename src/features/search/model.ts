import { getSearchTextParagraphs } from "@/design-system/components";

export type SearchArticle = {
  body?: string;
  category: string;
  date: string;
  id?: string;
  pressName?: string;
  title: string;
};

export type SearchPolicy = {
  details: Array<{ label: string; value: string }>;
  summary: string;
  tags: string[];
  title: string;
};

export type BodySearchResult<
  Article extends SearchArticle,
  Policy extends SearchPolicy,
> =
  | {
      article: Article;
      id: string;
      kind: "news";
      meta: string;
      searchQuery: string;
      searchTargetKey: string;
      snippet?: string;
      title: string;
    }
  | {
      id: string;
      kind: "policy";
      meta: string;
      policy: Policy;
      searchQuery: string;
      searchTargetKey: string;
      snippet?: string;
      title: string;
    };

export type SearchSelectionInput<
  Article extends SearchArticle,
  Policy extends SearchPolicy,
> =
  | {
      article: Article;
      kind: "news";
      searchQuery?: string;
      searchTargetKey?: string;
    }
  | {
      kind: "policy";
      policy: Policy;
      searchQuery?: string;
      searchTargetKey?: string;
    };

export function normalizeSearchKeyword(value: string) {
  return value.trim().toLocaleLowerCase("ko-KR");
}

function getBodySearchSnippet(text = "", normalizedQuery: string) {
  if (!normalizedQuery) {
    return text;
  }

  const normalizedText = text.toLocaleLowerCase("ko-KR");
  const matchIndex = normalizedText.indexOf(normalizedQuery);

  if (matchIndex === -1) {
    return text;
  }

  const start = Math.max(0, matchIndex - 32);
  const end = Math.min(text.length, matchIndex + normalizedQuery.length + 72);

  return `${start > 0 ? "..." : ""}${text.slice(start, end)}${
    end < text.length ? "..." : ""
  }`;
}

function getFirstMatchedSearchField(
  fields: Array<{ targetKey: string; text?: string }>,
  normalizedQuery: string,
) {
  return fields.find((field) =>
    (field.text ?? "").toLocaleLowerCase("ko-KR").includes(normalizedQuery),
  );
}

function getArticleSearchFields(article: SearchArticle) {
  return [
    { targetKey: "title", text: article.title },
    { targetKey: "category", text: article.category },
    ...getSearchTextParagraphs(article.body).map((paragraph, index) => ({
      targetKey: `body-${index}`,
      text: paragraph,
    })),
  ];
}

function getPolicySearchFields(policy: SearchPolicy) {
  return [
    { targetKey: "title", text: policy.title },
    { targetKey: "summary", text: policy.summary },
    { targetKey: "tags", text: policy.tags.join(" ") },
    ...policy.details.flatMap((detail, detailIndex) => [
      { targetKey: `detail-${detailIndex}-label`, text: detail.label },
      { targetKey: `detail-${detailIndex}-value`, text: detail.value },
    ]),
  ];
}

export function getBodySearchResults<
  Article extends SearchArticle,
  Policy extends SearchPolicy,
>({
  articles,
  normalizedQuery,
  policies,
}: {
  articles: Article[];
  normalizedQuery: string;
  policies: Policy[];
}): BodySearchResult<Article, Policy>[] {
  if (!normalizedQuery) {
    return [];
  }

  const searchQuery = normalizedQuery;
  const newsResults = articles.reduce<BodySearchResult<Article, Policy>[]>(
    (results, article, index) => {
      const matchedField = getFirstMatchedSearchField(
        getArticleSearchFields(article),
        normalizedQuery,
      );

      if (!matchedField) {
        return results;
      }

      results.push({
        article,
        id: article.id ?? `news-search-${index}`,
        kind: "news",
        meta: [article.category, article.pressName, article.date]
          .filter(Boolean)
          .join(" · "),
        searchQuery,
        searchTargetKey: matchedField.targetKey,
        snippet: getBodySearchSnippet(matchedField.text ?? article.title, normalizedQuery),
        title: article.title,
      });

      return results;
    },
    [],
  );
  const policyResults = policies.reduce<BodySearchResult<Article, Policy>[]>(
    (results, policy, index) => {
      const matchedField = getFirstMatchedSearchField(
        getPolicySearchFields(policy),
        normalizedQuery,
      );

      if (!matchedField) {
        return results;
      }

      results.push({
        id: `policy-search-${policy.title}-${index}`,
        kind: "policy",
        meta: ["국가정책", ...policy.tags].filter(Boolean).join(" · "),
        policy,
        searchQuery,
        searchTargetKey: matchedField.targetKey,
        snippet: getBodySearchSnippet(matchedField.text ?? policy.title, normalizedQuery),
        title: policy.title,
      });

      return results;
    },
    [],
  );

  return [...newsResults, ...policyResults];
}

import type { HomeArticle, PolicyItem } from "@/features/news/NewsViews";

export type BodySearchSelection =
  | {
      article: HomeArticle;
      id: number;
      kind: "news";
      searchQuery?: string;
      searchTargetKey?: string;
    }
  | {
      id: number;
      kind: "policy";
      policy: PolicyItem;
      searchQuery?: string;
      searchTargetKey?: string;
    };

export type BodySearchSelectionInput = SearchSelectionInput<HomeArticle, PolicyItem>;
