"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  newsApi,
  userApi,
} from "@/app/_newsroll/api";
import {
  currentUserId
} from "@/app/_newsroll/auth/current-user";
import type {
  UserPreference
} from "@/app/_newsroll/api/types";
import {
  NewsBlockCardButton
} from "@/design-system/components";
import {
  useEnterFromRightExitMotion
} from "@/design-system/templates";

import {
  ArticleDetailContent,
  HomeReelCard,
  HomeShell,
  NewsRollStateCard,
  defaultNewsDateTime,
  filterArticlesByBlockedKeywords,
  getHomeArticleFromNews,
  getLatestBreakingNewsItem,
  type BodySearchSelection,
  type HomeArticle,
  type HomeViewMode,
} from "@/features/news/NewsViews";
import { getDataUnavailableMessage } from "@/features/shared/DataUnavailableMessage";

function hasSelectedValues(values: string[]) {
  return values.length > 0;
}

function matchesUserHomePreference(
  article: HomeArticle,
  userPreference: UserPreference,
) {
  const matchesCategory =
    !hasSelectedValues(userPreference.categoryIds) ||
    (article.categoryId != null &&
      userPreference.categoryIds.includes(article.categoryId));
  const matchesPress =
    !hasSelectedValues(userPreference.pressIds) ||
    (article.pressId != null && userPreference.pressIds.includes(article.pressId));

  return matchesCategory && matchesPress;
}

function filterArticlesByUserPreference(
  articles: HomeArticle[],
  userPreference: UserPreference | null,
) {
  if (!userPreference) {
    return articles;
  }

  return articles.filter((article) =>
    matchesUserHomePreference(article, userPreference),
  );
}

export function HomeView({
  blockedKeywords,
  bodySearchSelection,
  isTextLarge,
  onOpenBreakingNews,
  onOpenNotifications,
  onOpenSearch,
  onToggleTextSize,
}: {
  blockedKeywords: string[];
  bodySearchSelection?: BodySearchSelection | null;
  isTextLarge: boolean;
  onOpenBreakingNews: () => void;
  onOpenNotifications: () => void;
  onOpenSearch: () => void;
  onToggleTextSize: () => void;
}) {
  const [homeViewMode, setHomeViewMode] = useState<HomeViewMode>(
    bodySearchSelection?.kind === "news" ? "block" : "reels",
  );
  const [detailOpen, setDetailOpen] = useState(
    bodySearchSelection?.kind === "news",
  );
  const [selectedDetailArticle, setSelectedDetailArticle] =
    useState<HomeArticle | null>(
      bodySearchSelection?.kind === "news" ? bodySearchSelection.article : null,
    );
  const [articles, setArticles] = useState<HomeArticle[]>([]);
  const [openCommentPanelKey, setOpenCommentPanelKey] = useState<string | null>(
    null,
  );
  const [userPreference, setUserPreference] = useState<UserPreference | null>(
    null,
  );
  const [isNewsLoading, setIsNewsLoading] = useState(true);
  const [isPreferenceLoading, setIsPreferenceLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);
  const closeHomeDetailImmediately = useCallback(() => {
    setDetailOpen(false);
  }, []);
  const homeDetailExitMotion = useEnterFromRightExitMotion({
    isOpen: detailOpen,
    onClose: closeHomeDetailImmediately,
  });

  function openHomeDetail(article: HomeArticle) {
    setOpenCommentPanelKey(null);
    setSelectedDetailArticle(article);
    setDetailOpen(true);
  }

  function getCommentPanelKey(article: HomeArticle, index: number) {
    return article.id ?? `${article.title}-${index}`;
  }

  useEffect(() => {
    if (bodySearchSelection?.kind !== "news") {
      return;
    }

    setHomeViewMode("block");
    openHomeDetail(bodySearchSelection.article);
  }, [bodySearchSelection]);

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
    setOpenCommentPanelKey(null);
  }, [detailOpen, homeViewMode]);

  useEffect(() => {
    let ignore = false;

    async function loadUserPreference() {
      setIsPreferenceLoading(true);

      try {
        const nextPreferences = await userApi.getUserPreferences(currentUserId);

        if (!ignore) {
          setUserPreference(nextPreferences[0] ?? null);
        }
      } catch {
        if (!ignore) {
          setUserPreference(null);
        }
      } finally {
        if (!ignore) {
          setIsPreferenceLoading(false);
        }
      }
    }

    loadUserPreference();

    return () => {
      ignore = true;
    };
  }, []);

  const preferredArticles = useMemo(
    () => filterArticlesByUserPreference(articles, userPreference),
    [articles, userPreference],
  );
  const visibleArticles = useMemo(
    () => filterArticlesByBlockedKeywords(preferredArticles, blockedKeywords),
    [preferredArticles, blockedKeywords],
  );
  const isHomeLoading = isNewsLoading || isPreferenceLoading;
  const hasArticles = visibleArticles.length > 0;
  const isBodySearchDetail =
    bodySearchSelection?.kind === "news" &&
    selectedDetailArticle != null &&
    (bodySearchSelection.article.id ?? bodySearchSelection.article.title) ===
      (selectedDetailArticle.id ?? selectedDetailArticle.title);
  const latestBreakingItem = getLatestBreakingNewsItem(visibleArticles);
  const breakingTitle =
    latestBreakingItem?.title ??
    getDataUnavailableMessage("속보", "를");

  return (
    <HomeShell
      breakingItem={latestBreakingItem}
      breakingTitle={breakingTitle}
      forceDockedDetail={isBodySearchDetail}
      isDetailOpen={detailOpen}
      isTextLarge={isTextLarge}
      mode={homeViewMode}
      newsCount={visibleArticles.length}
      onCloseDetail={homeDetailExitMotion.closeWithMotion}
      onOpenBreakingArticle={openHomeDetail}
      onModeChange={(nextMode) => {
        setOpenCommentPanelKey(null);
        setDetailOpen(false);
        setHomeViewMode(nextMode);
      }}
      onPanelChange={() => {
        setOpenCommentPanelKey(null);
      }}
      onOpenBreakingNews={onOpenBreakingNews}
      onOpenNotifications={onOpenNotifications}
      onOpenSearch={onOpenSearch}
      onToggleTextSize={onToggleTextSize}
    >
      {detailOpen ? (
        selectedDetailArticle ? (
          <ArticleDetailContent
            article={selectedDetailArticle}
            initialSearchQuery={
              isBodySearchDetail
                ? bodySearchSelection.searchQuery
                : undefined
            }
            initialSearchTargetKey={
              isBodySearchDetail
                ? bodySearchSelection.searchTargetKey
                : undefined
            }
            initialScrollTarget={
              isBodySearchDetail && bodySearchSelection.searchTargetKey
                ? "bodySearch"
                : undefined
            }
            isLeaving={homeDetailExitMotion.isLeaving}
          />
        ) : null
      ) : homeViewMode === "reels" ? (
        <section
          className={`container_newsFeed${isHomeLoading || newsError || !hasArticles ? " is_emptyState" : ""}`}
          id="home-news-reels-panel"
          role="tabpanel"
          aria-labelledby="home-news-view-tab-reels"
        >
          {isHomeLoading ? (
            <NewsRollStateCard role="status">
              <p className="text_commentEmpty">뉴스를 불러오는 중입니다.</p>
            </NewsRollStateCard>
          ) : newsError ? (
            <NewsRollStateCard role="alert">
              <p className="text_commentEmpty">{newsError}</p>
            </NewsRollStateCard>
          ) : hasArticles ? (
            visibleArticles.map((article, index) => {
              const commentPanelKey = getCommentPanelKey(article, index);

              return (
                <HomeReelCard
                  article={article}
                  commentPanelOpen={openCommentPanelKey === commentPanelKey}
                  index={index}
                  key={article.id ?? `${article.title}-${index}`}
                  onCommentPanelOpenChange={(open) => {
                    setOpenCommentPanelKey(open ? commentPanelKey : null);
                  }}
                  recordRecentOnView={false}
                />
              );
            })
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
          <div className="wrapper_newsGridScroll wrapper_gridList">
            {isHomeLoading ? (
              <NewsRollStateCard role="status">
                <p className="text_commentEmpty">뉴스를 불러오는 중입니다.</p>
              </NewsRollStateCard>
            ) : newsError ? (
              <NewsRollStateCard role="alert">
                <p className="text_commentEmpty">{newsError}</p>
              </NewsRollStateCard>
            ) : hasArticles ? (
              visibleArticles.map((article) => (
                <NewsBlockCardButton
                  categoryLabel={article.category}
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
