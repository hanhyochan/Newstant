"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  newsApi,
  welfareApi,
  type NewsListItem,
  type WelfarePolicy,
} from "@/app/_newsroll/api";
import { Icon } from "@/design-system/components";

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
      snippet?: string;
      title: string;
    }
  | {
      id: string;
      kind: "policy";
      meta: string;
      policy: Policy;
      snippet?: string;
      title: string;
    };

export type SearchSelectionInput<
  Article extends SearchArticle,
  Policy extends SearchPolicy,
> =
  | { article: Article; kind: "news" }
  | { kind: "policy"; policy: Policy };

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

  const newsResults: BodySearchResult<Article, Policy>[] =
    articles
      .filter((article) => getArticleFilterText(article).includes(normalizedQuery))
      .map((article, index) => ({
        article,
        id: article.id ?? `news-search-${index}`,
        kind: "news",
        meta: [article.category, article.pressName, article.date]
          .filter(Boolean)
          .join(" · "),
        snippet: getBodySearchSnippet(article.body ?? article.title, normalizedQuery),
        title: article.title,
      }));
  const policyResults: BodySearchResult<Article, Policy>[] = policies
    .filter((policy) => getPolicySearchText(policy).includes(normalizedQuery))
    .map((policy, index) => ({
      id: `policy-search-${policy.title}-${index}`,
      kind: "policy",
      meta: ["국가정책", ...policy.tags].filter(Boolean).join(" · "),
      policy,
      snippet: getBodySearchSnippet(
        [
          policy.summary,
          ...policy.details.flatMap((detail) => [detail.label, detail.value]),
        ].join(" "),
        normalizedQuery,
      ),
      title: policy.title,
    }));

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
    <section className="newsroll_search_page" aria-label="검색">
      <div className="newsroll_toolbar newsroll_search_top" aria-label="검색 도구">
        <button
          aria-label="검색 닫기"
          className="newsroll_toolbar_icon newsroll_search_close"
          onClick={onClose}
          type="button"
        >
          <span aria-hidden="true" />
        </button>
      </div>

      <div className="wrapper_searchContent">
        <form
          className="form_searchComposer newsroll_motion_enterUp"
          onSubmit={(event) => event.preventDefault()}
        >
          <label className="input_searchField">
            <span className="sr_only">통합검색어 입력</span>
            <input
              onChange={(event) => setQuery(event.currentTarget.value)}
              placeholder="검색 키워드를 입력해주세요"
              ref={searchInputRef}
              type="search"
              value={query}
            />
            <Icon name="search" />
          </label>
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
                <button
                  className="btn_searchResult"
                  key={`${result.kind}-${result.id}`}
                  onClick={() =>
                    onSelectResult(
                      result.kind === "news"
                        ? { article: result.article, kind: "news" }
                        : { kind: "policy", policy: result.policy },
                    )
                  }
                  type="button"
                >
                  <strong>{result.title}</strong>
                  <span>{result.meta}</span>
                  {result.snippet ? (
                    <p className="text_searchResultSnippet">{result.snippet}</p>
                  ) : null}
                </button>
              ))}
            </div>
          ) : (
            <p className="text_searchStatus">검색 결과가 없습니다.</p>
          )
        ) : null}
      </div>
    </section>
  );
}
