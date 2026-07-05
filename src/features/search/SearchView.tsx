"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  newsApi,
  welfareApi,
  type NewsListItem,
  type WelfarePolicy,
} from "@/shared/newsroll/api";
import {
  Icon,
  SearchHighlightText,
  SearchResultButton,

  SearchResultSkeleton,

  SkeletonList,
  TextInput,
} from "@/design-system/components";
import { NewsRollPurpleOverlayPage } from "@/design-system/templates";
import {
  getBodySearchResults,
  normalizeSearchKeyword,
  type SearchArticle,
  type SearchPolicy,
  type SearchSelectionInput,
} from "@/features/search/model";

type SearchViewProps<Article extends SearchArticle, Policy extends SearchPolicy> = {
  getNewsArticle: (item: NewsListItem, index: number) => Article;
  getPolicyItem: (item: WelfarePolicy) => Policy;
  onClose: () => void;
  onSelectResult: (selection: SearchSelectionInput<Article, Policy>) => void;
  unavailableMessage: string;
};

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
            <div className="list_searchResults" aria-busy="true">
              <SkeletonList
                count={4}
                renderItem={() => <SearchResultSkeleton />}
              />
            </div>
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
                  title={
                    <SearchHighlightText query={query}>
                      {result.title}
                    </SearchHighlightText>
                  }
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
