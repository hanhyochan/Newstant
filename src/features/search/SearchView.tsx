"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  newsApi,
  welfareApi,
  type NewsListItem,
  type WelfarePolicy,
} from "@/app/_newsroll/api";
import {
  getSearchTextParagraphs,
  Icon,
  SearchHighlightText,
  SearchResultButton,
  TextInput,
} from "@/design-system/components";
import { NewsRollPurpleOverlayPage } from "@/design-system/templates";

type SearchArticle = {
  body?: string;
  category: string;
  date: string;
  id?: string;
  pressName?: string;
  title: string;
};

type SearchPolicy = {
  details: Array<{ label: string; value: string }>;
  summary: string;
  tags: string[];
  title: string;
};

type BodySearchResult<Article extends SearchArticle, Policy extends SearchPolicy> =
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

type SearchViewProps<Article extends SearchArticle, Policy extends SearchPolicy> = {
  getNewsArticle: (item: NewsListItem, index: number) => Article;
  getPolicyItem: (item: WelfarePolicy) => Policy;
  onClose: () => void;
  onSelectResult: (selection: SearchSelectionInput<Article, Policy>) => void;
  unavailableMessage: string;
};

function normalizeSearchKeyword(value: string) {
  return value.trim().toLocaleLowerCase("ko-KR");
}

function getArticleFilterText(article: SearchArticle) {
  return [article.title, article.body, article.category, article.pressName]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("ko-KR");
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

function getPolicySearchText(policy: SearchPolicy) {
  return [
    policy.title,
    policy.summary,
    ...policy.tags,
    ...policy.details.flatMap((detail) => [detail.label, detail.value]),
  ]
    .join(" ")
    .toLocaleLowerCase("ko-KR");
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

function getBodySearchResults<
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
        [
          { targetKey: "title", text: policy.title },
          { targetKey: "summary", text: policy.summary },
          { targetKey: "tags", text: policy.tags.join(" ") },
          ...policy.details.flatMap((detail, detailIndex) => [
            { targetKey: `detail-${detailIndex}-label`, text: detail.label },
            { targetKey: `detail-${detailIndex}-value`, text: detail.value },
          ]),
        ],
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

export function SearchView<Article extends SearchArticle, Policy extends SearchPolicy>({
  getNewsArticle,
  getPolicyItem,
  onClose,
  onSelectResult,
  unavailableMessage,
}: SearchViewProps<Article, Policy>) {
  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const normalizedQuery = normalizeSearchKeyword(query);
  const searchResults = useMemo(
    () =>
      getBodySearchResults({
        articles,
        normalizedQuery,
        policies,
      }),
    [articles, normalizedQuery, policies],
  );

  useEffect(() => {
    let ignore = false;

    async function loadSearchData() {
      setIsSearchLoading(true);
      setSearchError(null);

      try {
        const [nextNews, nextPolicies] = await Promise.all([
          newsApi.getNewsList(),
          welfareApi.getWelfarePolicyList("all"),
        ]);

        if (!ignore) {
          setArticles(nextNews.map(getNewsArticle));
          setPolicies(nextPolicies.map(getPolicyItem));
        }
      } catch {
        if (!ignore) {
          setSearchError(unavailableMessage);
          setArticles([]);
          setPolicies([]);
        }
      } finally {
        if (!ignore) {
          setIsSearchLoading(false);
        }
      }
    }

    loadSearchData();

    return () => {
      ignore = true;
    };
  }, [getNewsArticle, getPolicyItem, unavailableMessage]);

  useEffect(() => {
    window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  }, []);

  return (
    <NewsRollPurpleOverlayPage
      ariaLabel="검색"
      closeLabel="검색 닫기"
      onClose={onClose}
    >
        <form
          className="form_searchComposer motion_enterUp"
          onSubmit={(event) => event.preventDefault()}
        >
          <TextInput
            aria-label="통합검색어 입력"
            mode="dark"
            name="global-search"
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="검색 키워드를 입력해주세요"
            ref={searchInputRef}
            rightSlot={<Icon name="search" />}
            type="search"
            value={query}
          />
        </form>

        {normalizedQuery ? (
          isSearchLoading ? (
            <p className="text_searchStatus" role="status">
              뉴스를 불러오는 중입니다.
            </p>
          ) : searchError ? (
            <p className="text_searchStatus" role="alert">
              {searchError}
            </p>
          ) : searchResults.length > 0 ? (
            <div className="list_searchResults" aria-label="통합검색 결과">
              {searchResults.map((result) => (
                <SearchResultButton
                  key={`${result.kind}-${result.id}`}
                  onClick={() =>
                    onSelectResult(
                      result.kind === "news"
                        ? {
                            article: result.article,
                            kind: "news",
                            searchQuery: result.searchQuery,
                            searchTargetKey: result.searchTargetKey,
                          }
                        : {
                            kind: "policy",
                            policy: result.policy,
                            searchQuery: result.searchQuery,
                            searchTargetKey: result.searchTargetKey,
                          },
                    )
                  }
                  meta={result.meta}
                  snippet={
                    result.snippet ? (
                      <SearchHighlightText query={query}>
                        {result.snippet}
                      </SearchHighlightText>
                    ) : undefined
                  }
                  title={result.title}
                />
              ))}
            </div>
          ) : (
            <p className="text_searchStatus">검색 결과가 없습니다.</p>
          )
        ) : null}
    </NewsRollPurpleOverlayPage>
  );
}
